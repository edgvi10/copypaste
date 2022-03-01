import "@/root/styles/global.scss";
import "@/root/styles/nprogress.scss";

import router from "next/router";

import NProgress from "nprogress";

router.onRouteChangeStart = () => NProgress.start();
router.onRouteChangeComplete = () => NProgress.done();
router.onRouteChangeError = () => NProgress.done();

export default function MyApp({ Component, pageProps, appProps }) {
    return <>
        <Component {...appProps} {...pageProps} />
    </>
}