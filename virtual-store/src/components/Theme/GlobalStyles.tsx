import { createGlobalStyle } from "styled-components";
import reset from "styled-reset"; //installed through npm install styled-reset
import { Fonts } from "./mixins";

// Create file ./src/styled.d.ts for the variables to be recognized in the project

const GlobalStyle = createGlobalStyle<{disabled?:boolean}>`
    ${reset}
    
    html {
        /* Approximately 1.3rem=16px *** 1.7vw=16px *** 1rem = 16px */
        ${Fonts({minSize: '1rem', prefValue: '1.7vw', maxSize: '1rem'})}
        font-family: ${props => props.theme.fonts.family};
        font-weight: ${props => props.theme.fonts.weights.light};
    }

    html, body {
        background-color: ${props => props.theme.colors.blackColor};
        color: ${props => props.theme.colors.whiteColor};
        scrollbar-color: hsla(0, 0%, 100%, 0.3) transparent;
        scrollbar-width: 16px;
        height: 100%;
    }
    body {
        font-family: ${props => props.theme.fonts.family};
        margin: 0;
    }
    /* main {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        overflow-y: auto;
    } */

    h1 {
        /* Approximately 2.6=41.6px *** 2.3vw=41.5px-32.1px *** 2rem=32px */
        ${Fonts({minSize: '2rem', prefValue: '2.3vw', maxSize: '2.6rem'})}
        font-weight: ${props => props.theme.fonts.weights.semiBold};
    }

    h2 {
        /* Approximately 1.3rem=25.6px *** 1.7vw=25.9px-20.9px *** 1rem = 20.8px */
        ${Fonts({minSize: '1.3rem', prefValue: '1.7vw', maxSize: '1.6rem'})}
        font-weight: ${props => props.theme.fonts.weights.semiBold};
    }

    h3, table thead, caption, fieldset {
        /* Approximately 1.15rem=18.4px *** 1.7vw=18.3px-17.7px *** 1.1rem = 17.6px */
        ${Fonts({minSize: '1.1rem', prefValue: '1.7vw', maxSize: '1.15rem'})}
        font-weight: ${props => props.theme.fonts.weights.semiBold};
    }

    h4, td, ul {
        /* Approximately 1rem = 16px *** 1.7vw=16px *** 1rem = 16px */
        ${Fonts({minSize: '1rem', prefValue: '1.7vw', maxSize: '1rem'})}
        font-weight: ${props => props.theme.fonts.weights.medium};
    }

    h5 {
        /* Approximately .9rem=14.4px *** 1.7vw=16px *** .9rem=14.4px */
        ${Fonts({minSize: '.9rem', prefValue: '1.7vw', maxSize: '.9rem'})}
        font-weight: ${props => props.theme.fonts.weights.medium};
    }

    h6 {
        /* Approximately .9rem=14.4px *** 1.7vw=16px *** .9rem=14.4px */
        ${Fonts({minSize: '1rem', prefValue: '1.7vw', maxSize: '1rem'})}
        font-weight: ${props => props.theme.fonts.weights.light};
    }

    input {
        font-family: inherit;
        line-height: inherit;
        color: ${props => props.theme.colors.inputColor};
        min-width: 10em;
        /* the border gradient */
        -o-border-image: linear-gradient(to right, #3acfd5 0%, #3a4ed5 100%) 1;
            border-image: linear-gradient(to right, #3acfd5 0%, #3a4ed5 100%) 1;
    }

    a {
        /* text-decoration: none; */
        color: ${props => props.theme.colors.whiteColor};
    }

    button {
        /* cursor: pointer; */
        border-radius: 25px;
        background-color: ${props => props.theme.colors.btnColor};
        color: ${props => props.theme.colors.whiteColor};
        padding: 8px 18px;
        vertical-align: bottom;
        &:hover {
            border-color: ${props => props.theme.colors.blackColor};
            background-color: ${props => props.theme.colors.btnHover};
        }
        &:disabled {
            cursor: not-allowed;
            opacity: 0.5; 
        }
    }

    footer {
        background-color: ${props => props.theme.colors.blackColor};
    }
`

export default GlobalStyle;