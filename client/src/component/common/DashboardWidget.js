import React from "react";
import PropTypes from "prop-types";

const DashboardWidget = ({ title, sections, align = "center" }) => {
    return (
        <div className="bg-aston_widget_green text-aston_yellow p-4 rounded-lg shadow-3xl flex flex-col justify-between w-full h-full transition-transform transform hover:rotate-3 hover:opacity-95">
            <p className="text-white text-sm uppercase font-bold mt-2 text-center">
                {title}
            </p>
            {sections.length > 0 ? (
                <div className={`flex justify-${align} mb-2 flex-1`}>
                    {sections.map((section, index) => (
                        <div key={index} className="flex flex-col items-center mx-2">
                            <span className="text-aston_yellow text-md font-bold">
                                {section.number}
                            </span>
                            <span className="text-white text-sm uppercase">
                                {section.label}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex justify-center items-center flex-1 text-white text-sm italic">
                    No data available
                </div>
            )}
        </div>
    );
};

DashboardWidget.propTypes = {
    title: PropTypes.string.isRequired,
    sections: PropTypes.arrayOf(
        PropTypes.shape({
            number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            label: PropTypes.string.isRequired
        })
    ).isRequired,
    align: PropTypes.oneOf(["start", "center", "end"])
};

DashboardWidget.defaultProps = {
    align: "center"
};

export default React.memo(DashboardWidget);
