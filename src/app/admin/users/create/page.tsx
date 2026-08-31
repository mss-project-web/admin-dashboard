import UserForm from "../components/UserForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "เพิ่มผู้ใช้งานใหม่ | MSS Admin",
};

export default function CreateUserPage() {
  return (
    <div className="pb-32 w-full max-w-full space-y-6">
      

      <UserForm />
    </div>
  );
}
