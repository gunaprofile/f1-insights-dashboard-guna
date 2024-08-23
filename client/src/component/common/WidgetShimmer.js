import React from "react";

const WidgetShimmer = ({ title, sections = 4 }) => {
    return (
        <main className="w-full py-5 px-5" aria-hidden="true">
            {title && <h2 className="text-lg font-semibold mb-4 text-shimmer_text">{title}</h2>}
            <section className="flex justify-between items-stretch space-x-4">
                {[...Array(sections)].map((_, index) => (
                    <div
                        key={index}
                        className="bg-shimmer_bg p-4 rounded-lg shadow-3xl flex flex-col justify-between w-full h-28 animate-pulse"
                    ></div>
                ))}
            </section>
        </main>
    );
};

export default WidgetShimmer;
