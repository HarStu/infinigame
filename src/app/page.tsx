import { api } from "@/trpc/server";
import { Chat } from '@/app/_components/chat'

export default async function Home() {
  return (
    <div>
      hello world
      <Chat />
    </div >
  );
}
