export const getLinkClasses = (path, activeLink) => {
    return `text-lg px-8 py-2 rounded transition ${
        activeLink === path
        ? "text-aston_yellow cursor-default"
        : "text-white hover:bg-aston_yellow hover:text-black cursor-pointer opacity-70"
    }`;
};
