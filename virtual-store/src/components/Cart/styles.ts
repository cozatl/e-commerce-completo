import styled from 'styled-components';
import { BoxSizing, BreakPoint2, BreakPoint7, FlexBox, Fonts } from '../Theme/mixins';
import { css } from 'styled-components';

interface NavLinksProps {
  $isOpen: boolean;
};

const StyledCart = styled.div<NavLinksProps>`
    ${BoxSizing()};
    ${FlexBox};
    flex-direction: column;
    /* flex: 1; */
    gap: 20px;
    justify-content: normal;
    width: 500px;
    overflow-y: scroll;
    padding: 20px;
    transition: all 1.5s ease;
    background: linear-gradient(#473a3a, #222);
    border: 1px solid #ccc;
    position: fixed;
    right: ${props => (props.$isOpen ? '0px' : '-1000px')};
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

    h2 {
        width: 100%;
        text-align: center;
        /* Approximately 1.3rem=20.8px *** 1.7vw=20.7px-17.7px *** 1.1rem = 17.6px */
        ${Fonts({minSize: '1.1rem', prefValue: '1.7vw', maxSize: '1.3rem'})}
        font-weight: ${props => props.theme.fonts.weights.semiBold};
        padding: 25px 0;
        ${BoxSizing};
        ${BreakPoint2(css`
            padding: 15px 0;
        `)};
    }
    ${BreakPoint7(css`
        width: ${props => ((props as any).$isOpen ? '100%' : '0%')}; // Add (props as any) to inherit parent props and avoid failures
    `)};
`;

const StyledCartItem = styled.div`
    border-bottom: 1px solid #c9baba;
    ${FlexBox};
    flex-wrap: wrap;
    align-items: center;
    padding: 5px;
    gap: 10px;
    ${BoxSizing};
    img {
        width: 60px;
        ${BreakPoint7(css`
            width: 100px;
        `)};
    }
    i {
        width: 35px;
        cursor: pointer;
        img {
            width: 100%;
        }
    }
    p:nth-child(3) {
        font-weight: 600;
    }
    div:nth-child(5) { // Configure increment/decrement buttons
        flex-basis: 100%;
        text-align: center;
    }
    ${BreakPoint7(css`
        flex-direction: column;        
        align-items: center;
        div:nth-child(5) { // Configure increment/decrement buttons
            flex-basis: auto;
            text-align: center;
        }
    `)};
`;

// const StyledButtonCart = styled.button`
//     border-radius: 25px;
// 	background-color: ${props => props.theme.colors.btnColor};
// 	color: ${props => props.theme.colors.whiteColor};
// 	padding: 8px 18px;width: 100px;
// 	vertical-align: bottom;
// 	&:hover {
// 		border-color: ${props => props.theme.colors.blackColor};
//         background-color: ${props => props.theme.colors.btnHover};
// 	}
// `;

export {
    StyledCart,
    StyledCartItem,
    // StyledButtonCart,
};