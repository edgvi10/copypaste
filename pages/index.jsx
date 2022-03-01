import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "@/root/components/Header";
import api from "@/root/src/services/api";

import NProgress from "nprogress";

import { strtotime, date } from "locutus/php/datetime";
import { normalizeString, slugify } from "@/root/src/libs/utils";

const pkg = require("@/root/package.json");

export default function Home() {
    const router = useRouter();
    const [loading, toggleLoading] = useState(false);
    const [form, setForm] = useState({
        privacy: "public",
        expires: "60",
        expire_at: date("Y-m-d H:i:s", strtotime(`+60 minutes`))
    });

    const expire_time = ["5", "10", "30", "60"];

    const handleInputChange = (e) => {
        const input = e.target;

        const key = input.name !== "" ? input.name : input.id;
        var value = input.value;

        // var value = input.value.toString().toLowerCase();
        if (key === "slug") value = slugify(input.value.replaceAll("-", " "));
        if (key === "expires") form.expire_at = date("Y-m-d H:i:00", strtotime(`+${value} minutes`));

        setForm({ ...form, [key]: value });
    };


    const handleFormSubmit = (e) => {
        e.preventDefault();
        NProgress.start();

        const payload = { ...form };
        console.log("payload", payload);

        toggleLoading(true);
        router.push(`/paste/${payload.slug}`);
    };

    const toggleTheme = (theme) => {
        if (!theme) localStorage.setItem("theme", localStorage.getItem("theme") === "dark" ? "light" : "dark");
        else localStorage.setItem("theme", theme);
        router.reload();
    };

    const [theme, setTheme] = useState("");
    useEffect(() => {
        setTheme(localStorage.getItem("theme"));
    }, []);

    return <main className="d-flex flex-fill flex-column">
        <Header title="Copypaste" />

        <section className="container-fluid py-5 my-md-auto align-self-center">
            <div className="row justify-content-center align-items-center">
                <div className="col-11 col-sm-10 col-md-10 col-lg-8 col-xl-6">
                    <form onSubmit={handleFormSubmit} className="d-flex flex-column gap-3">
                        <div className="input-group shadow-sm dropdown">

                            <input type="search" name="slug" id="slug" placeholder="Repositório" className="form-control form-control-lg" autoComplete="off" autoCorrect="off" spellCheck="false" value={form.slug ?? ""} onChange={handleInputChange} maxLength="16" />
                        </div>

                        <div className="d-flex flex-row justify-content-between gap-3">
                            <div className="input-group dropdown">
                                <i className="input-group-text fal fa-stopwatch"></i>
                                <select name="expires" value={form.expires} onChange={handleInputChange} className="form-select disabled" disabled>
                                    {expire_time.map(time => <option key={time} value={time}>{time.padStart(2, 0)} min</option>)}
                                </select>
                            </div>

                            <div className="input-group">
                                {form.privacy === "private" ? <i className="input-group-text fas fa-lock"></i> : <i className="input-group-text fas fa-globe"></i>}
                                <select name="privacy" id="select-privacy" className="form-select" value={form.privacy} onChange={handleInputChange}>
                                    <option value="public">Público</option>
                                    <option value="private" disabled>Privado (em breve)</option>
                                </select>
                            </div>
                        </div>
                        <div className="d-flex flex-row justify-content-between">
                            <a onClick={() => toggleTheme()} className="btn btn-outline-secondary btn-lg"><i className={`fad ${theme == "light" ? "fa-moon-cloud" : "fa-sun-cloud"}`} /></a>
                            <button type="submit" className="btn btn-primary btn-lg fw-bold text-uppercase lh-100 px-5" disabled={loading}>{loading ? <i className="fal fa-spinner-third fa-spin" /> : "Criar"}</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    </main>
}
