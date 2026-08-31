import PrayerRoomForm from "../components/PrayerRoomForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "เพิ่มห้องละหมาดใหม่ | MSS Admin",
};

export default function CreatePrayerRoomPage() {
  return (
    <div className="pb-32 w-full max-w-full space-y-6">
      

      <PrayerRoomForm />
    </div>
  );
}
