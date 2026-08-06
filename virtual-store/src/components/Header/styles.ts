import styled, { css } from "styled-components";
import { BoxSizing, BreakPoint5, BreakPoint6, BreakPoint7, FlexBox } from "../Theme/mixins";

interface NavLinksProps {
  $isOpen: boolean;
};

const StyledHeader = styled.header`
    width: 100%;
    padding: 20px 50px;
    background-color: ${props => props.theme.colors.grayColor};
    ${FlexBox()}; /* Default flex configuration */
    align-items: center;
    height: 120px;
    ${BoxSizing()};
    div {
        ${FlexBox()}; /* Default flex configuration */
    }
    img {
        width: 100px;
    }
    #menu {
        filter: invert(72%) sepia(13%) saturate(1109%) hue-rotate(186deg) brightness(99%) contrast(91%);
    }
    i {
        width: 50px;
        img {
            width: 80%;
            cursor: pointer;
        }
    }
    
    div:nth-child(3) {
        flex-direction: column;
        align-items: center;
    }
    div:nth-child(4) {
        div:nth-child(2) {
            position: absolute;
            top: 35px;
            right: 60px;
            background: red;
            color: white;
        }
    }
    
    ${BreakPoint5(css`
        padding: 15px;
        /* width: 60px; */
        img {
            width: 100px;
        }
        i {
            width: 50px;
            cursor: pointer;
        }
    `)};
    ${BreakPoint6(css`
        div:nth-child(3) {
            img {
                display: none;
            }
    }
    `)};
`;

const StyledMenu = styled.div<NavLinksProps>`
    ${BoxSizing()};
    width: 300px;
    padding: 20px;
    transition: all 1.5s ease;
    background: linear-gradient(#473a3a, #222);
    border: 1px solid #ccc;
    position: fixed;
    left: ${props => (props.$isOpen ? '0px' : '-1000px')};
    top: ${props => props.theme.itemDimensions.headerHeight};
    height: 85%;
    
    ul ul {
        max-height: 0; /* Hide menu (high value = 0) */
        overflow: hidden; /* Hide content while it is collapsed */
        opacity: 0; /* Transparent */
        transform: translateY(-4px); /* Slight upward shift */
        pointer-events: none; /* Avoid focus / hover while it is closed */
        transition: max-height 0.7s ease, opacity 0.6s ease, transform 0.6s ease; /* Slower effect by adjusting duration */
    }
    li {
        transition: all 2.5s ease;        
    }
    li:hover > ul{
        padding: 0px 0px 0px 25px;
        background: linear-gradient(#000, #222);
        /* Expanded element */
        max-height: 500px; /* Adjust value if more items are added */
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
    }
    ${BreakPoint7(css`
        width: ${props => ((props as any).$isOpen ? '100%' : '0%')}; // Add (props as any) to inherit parent props and avoid failures
    `)};
`;

export {
    StyledHeader,
    StyledMenu,
};