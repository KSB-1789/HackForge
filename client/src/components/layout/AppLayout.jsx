import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";

// Every signed-in page renders inside this shell. P1's pages expect the
// .hf-app wrapper for their min-height/background, so it stays.
export default function AppLayout() {
  return (
    <div className="hf-app">
      <Topbar />
      <Outlet />
    </div>
  );
}
