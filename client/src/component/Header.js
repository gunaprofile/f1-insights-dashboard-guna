import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_LINKS } from "../constants";
import { getLinkClasses } from "../utils";
import logo from "../assets/img/logo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';

// Logo Component
function Logo() {
    return (
        <div className="absolute left-1/2 transform -translate-x-1/2">
            <a
                href="https://www.astonmartinf1.com"
                aria-label="Aston Martin F1"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img
                    src={logo}
                    alt="AMF1 Team 2024 logo header white"
                    className="h-14"
                />
            </a>
        </div>
    );
}

// Social Links Component
function SocialLinks() {
    return (
        <div className="ml-auto mr-4 flex space-x-4 items-center">
            <a
                href="https://www.linkedin.com/in/gunaprofile/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-white hover:text-yellow-500"
            >
                <FontAwesomeIcon icon={faLinkedin} size="lg" />
            </a>
            <a
                href="https://github.com/your-username"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-white hover:text-yellow-500"
            >
                <FontAwesomeIcon icon={faGithub} size="lg" />
            </a>
        </div>
    );
}

// Main Header Component
function Header() {
    const { pathname } = useLocation();
    const [currentPath, setCurrentPath] = useState(pathname);

    useEffect(() => {
        setCurrentPath(pathname);
    }, [pathname]);

    const navItems = useMemo(() => {
        return NAV_LINKS.map((link) => (
            <li key={link.path}>
                <Link
                    to={link.path}
                    className={getLinkClasses(link.path, currentPath)}
                >
                    {link.label}
                </Link>
            </li>
        ));
    }, [currentPath]);

    return (
        <header className="bg-dark_green w-full py-4 shadow-3xl">
            <div className="max-w-screen-l mx-auto flex items-center relative">
                <nav className="flex flex-1">
                    <ul className="flex space-x-4">
                        {navItems}
                    </ul>
                </nav>
                <Logo />
                <SocialLinks />
            </div>
        </header>
    );
}

export default Header;
