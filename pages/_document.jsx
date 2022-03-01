import Document, { Html, Head, Main, NextScript } from "next/document"

export default class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx)

        return { ...initialProps }
    }

    render() {
        return (
            <Html>
                <Head>
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                    <meta name="theme-color" content="#212121" />
                    <meta name="msapplication-navbutton-color" content="#212121" />

                    <link rel="preconnect" href="https://fonts.gstatic.com" />
                    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;600&display=swap" rel="stylesheet" />

                    <link rel="stylesheet" href="/assets/plugins/material-colors/material-colors.min.css" />
                    <link rel="stylesheet" href="/assets/plugins/fontawesome/css/all.min.css" />

                    <script src="/assets/plugins/bootstrap/bootstrap.bundle.min.js"></script>
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}