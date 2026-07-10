import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logMutation } from './systemLogging';

/**
 * Response envelope compatible with the previous NestJS backend:
 *   success -> { status: 'success', data, message, status_code }
 *   fail    -> { status: 'fail', data: null, message, status_code, errors? }
 *
 * The frontend services depend on this exact shape, so keep it stable.
 */
export function ok<T>(data: T, message = 'OK', statusCode = 200) {
    return NextResponse.json(
        { status: 'success', data, message, status_code: statusCode },
        { status: statusCode },
    );
}

export function failBody(message: string, statusCode = 400, errors?: unknown) {
    return NextResponse.json(
        { status: 'fail', data: null, message, status_code: statusCode, ...(errors ? { errors } : {}) },
        { status: statusCode },
    );
}

/**
 * Some old controllers returned a pre-formatted { status, data, message } object
 * which the TransformInterceptor then wrapped AGAIN, so the frontend reads
 * `response.data.data.data`. Reproduce that exact double envelope here.
 */
export function okNested<T>(data: T, message = 'OK', statusCode = 200) {
    return ok({ status: 'success', data, message, status_code: statusCode }, 'OK', statusCode);
}

/** Throwable HTTP error, mirrors Nest's HttpException family. */
export class ApiError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const Unauthorized = (m = 'Unauthorized') => new ApiError(m, 401);
export const Forbidden = (m = 'Forbidden') => new ApiError(m, 403);
export const NotFound = (m = 'Not found') => new ApiError(m, 404);
export const BadRequest = (m = 'Bad request') => new ApiError(m, 400);

/**
 * Wrap a route handler so thrown ApiError / ZodError become the standard
 * fail envelope, mirroring the old AllExceptionsFilter.
 */
export function handle(
    fn: (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>,
) {
    return async (req: Request, ctx: { params: Promise<Record<string, string>> }): Promise<Response> => {
        try {
            const res = await fn(req, ctx);
            // Auto-log successful mutations (replaces the old SystemLogInterceptor).
            // Logging must never break the actual response.
            try {
                const params = ctx?.params ? await ctx.params.catch(() => undefined) : undefined;
                await logMutation(req, params, res.status);
            } catch (logErr) {
                console.error('[api] auto-log failed:', logErr);
            }
            return res;
        } catch (err) {
            if (err instanceof ZodError) {
                const errors = err.issues.map((i) => ({
                    field: i.path.join('.'),
                    errors: [i.message],
                }));
                return failBody('Validation failed', 400, errors);
            }
            if (err instanceof ApiError) {
                return failBody(err.message, err.statusCode);
            }
            console.error('[api] unhandled error:', err);
            return failBody('Internal server error', 500);
        }
    };
}
