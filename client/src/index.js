import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./component/App";
import "./index.css";

// Lazy-loaded components
const RaceOverviewDashboard = lazy(() =>
    import("./component/RaceOverviewDashboard")
);
const BarRaceChart = lazy(() => import("./component/BarRaceChart"));
const TimelineRaceChart = lazy(() => import("./component/TimelineRaceChart"));

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: (
                    <Suspense fallback={<div>Loading...</div>}>
                        <RaceOverviewDashboard />
                    </Suspense>
                ),
            },
            {
                path: "/analysis",
                element: (
                    <Suspense fallback={<div>Loading...</div>}>
                        <TimelineRaceChart />
                    </Suspense>
                ),
            },
            {
                path: "/teams",
                element: (
                    <Suspense fallback={<div>Loading...</div>}>
                        <BarRaceChart />
                    </Suspense>
                ),
            },
        ],
    },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);
