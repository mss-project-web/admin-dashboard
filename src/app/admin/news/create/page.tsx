import NewsForm from "../components/NewsForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "เพิ่มข่าวสารใหม่ | MSS Admin",
};

export default function CreateNewsPage() {
  return (
    <div className="pb-32 w-full max-w-full space-y-6">
      

      <NewsForm />
    </div>
  );
}
