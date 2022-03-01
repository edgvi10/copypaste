import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const pkg = require("@/root/package.json");

export default function Header({ title, hide, ...props }) {
    const [bootstrap, setBootstrap] = useState("bootstrap.min.css");
    useEffect(() => {
        var ls_theme = localStorage.getItem("theme");

        if (ls_theme === null || ls_theme === "" || ls_theme === undefined) {
            if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) localStorage.setItem("theme", "dark");
            else localStorage.setItem("theme", "light");
        }

        var theme = localStorage.getItem("theme");
        if (theme === "dark") setBootstrap("bootstrap.night.min.css");
        else setBootstrap("bootstrap.min.css");
    }, []);
    return <>
        <link rel="stylesheet" href={`/assets/plugins/bootstrap/${bootstrap}`} />
        <Head>
            <title>{title ?? pkg.description}</title>

            <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,shrink-to-fit=no" />
        </Head>
        <header className="navbar navbar-dark bg-black shadow-sm navbar-expand-md">
            <div className="container-fluid">
                <Link href="/"><a className="navbar-brand fw-bold me-auto">Copypaste</a></Link>

                <button className="navbar-toggler border-0 p-2 btn btn-link text-light btn-lg" type="button" data-bs-toggle="collapse" data-bs-target="#navigation"><i className="fal fa-bars" /></button>

                <div id="navigation" className="collapse navbar-collapse">
                    <ul className="navbar-nav nav m-0 ms-auto">
                        <li className="nav-item"><Link href="/"><a className="nav-link">Home</a></Link></li>
                        <li className="nav-item"><Link href="/"><a className="nav-link">Privacidade</a></Link></li>
                        {pkg.authors.map((author, index) => {
                            return <li key={index} className="nav-item"><a href={`${author.homepage}`} className="nav-link" target="_blank"><i className="fab fa-github" /> {author.name}</a></li>;
                        })}
                    </ul>

                </div>
            </div>
        </header>
    </>;
}