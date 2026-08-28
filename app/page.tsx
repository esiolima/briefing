import { redirect } from "next/navigation";
import { getRequesterIdentity } from "@/lib/identity";

export default function HomePage() {
  const identity = getRequesterIdentity();
  redirect(identity ? "/dashboard" : "/identificacao");
}
