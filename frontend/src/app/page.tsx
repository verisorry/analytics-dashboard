import Dashboard from "@/app/dashboard";

export default function Home() {

  return (
    <div className="flex flex-col items-center justify-center w-auto m-6 my-[35%] md:my-[10%]">
      <div className="w-[90%] md:w-[80%] flex flex-col gap-6">
        <Dashboard />
      </div>
    </div>
  );
}
