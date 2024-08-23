export const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost/api/';

export const NAV_LINKS = [
    { path: "/", label: "Dashboard" },
    { path: "/analysis", label: "Event Analysis" },
    { path: "/teams", label: "Teams Points Progression" },
];

export const WIDGET_API_URLS = [
    `${apiBaseUrl}races-completed`,
    `${apiBaseUrl}aston-martin-standings`,
    `${apiBaseUrl}current-status`,
    `${apiBaseUrl}countdown`,
];

export const statisticsOptions = [
    { value: 'position', label: 'Position' },
    { value: 'points', label: 'Points' },
    { value: 'fastestLap', label: 'Fastest Lap Time' }
];

export const customStyles = {
    control: (baseStyles, state) => ({
        ...baseStyles,
        borderColor: '#cedc00',
        backgroundColor: 'rgba(206, 220, 0, 0.1)',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(206, 220, 0, 0.3)' : null,
        '&:hover': { borderColor: '#cedc00' },
    }),
    option: (baseStyles, state) => ({
        ...baseStyles,
        backgroundColor: state.isSelected ? '#cedc00' : baseStyles.backgroundColor,
        color: state.isSelected ? '#00241f' : baseStyles.color,
        opacity: state.isSelected ? 1 : 0.8,
        '&:hover': { backgroundColor: '#cedc00', color: '#00241f' },
    }),
    multiValue: (baseStyles) => ({
        ...baseStyles,
        backgroundColor: 'rgba(206, 220, 0, 0.8)',
        border: '1px solid #cedc00',
    }),
    multiValueLabel: (baseStyles) => ({ color: '#00241f' }),
    multiValueRemove: (baseStyles) => ({
        ...baseStyles,
        color: '#CC2D37',
        '&:hover': { backgroundColor: '#cedc00', color: '#CC2D37' },
    }),
};
