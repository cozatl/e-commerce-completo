'use client'; // Required in the App Router for client-side hooks and avoids hydrated error
import styled from "styled-components";
import { BoxSizing, FlexBox } from "../Theme/mixins";

const StyledMain = styled.main`
    min-height: 100vh;
    ${FlexBox()};
    ${BoxSizing()};
    align-items: center;
    justify-content: center;
    background: ${props => props.theme.colors.bgMainDivColor};
    background: '#0f1117'
    article {
        background: #1a1d27;
        border: 1px solid #2a2d3a;
        border-radius: 4px;
        padding: 48px;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 0 40px rgba(0,0,0,0.4)
    }
`;

const StyledLoginHeader = styled.div`
    margin-bottom: 40px;
    p {
        color: #4a7fa5;
        //font-size: 11px;
        letter-spacing: 3px;
        text-transform: uppercase;
        margin-bottom: 8px;
    }
    h1 {
        color: #e8e8e8;
        font-size:24px;
        font-weight: normal;
        margin: 0;
    }
`;

const StyledLoginFields = styled.div`
    margin-bottom: 24px;
    label {
        display: block;
        color: #888;
        //font-size: 11px;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 8px;
    }
    input {
        width: 100%;
        padding: 12px 16px;
        background: #0f1117;
        border: 1px solid #2a2d3a;
        border-radius: 2px;
        color: #e8e8e8;
        font-size: 14px;
        outline: none;
        ${BoxSizing()};
    }
`;

export {
    StyledMain,
    StyledLoginHeader,
    StyledLoginFields,
};