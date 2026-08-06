import { css, RuleSet } from "styled-components";

type FontsProps = {
    minSize: string;
    prefValue: string;
    maxSize: string;
}
const Fonts = ({minSize, prefValue, maxSize}:FontsProps): RuleSet<object> => css`
    font-size: clamp(${minSize}, ${prefValue}, ${maxSize});
    
`;

const BoxSizing = (): RuleSet<object> => css`
    box-sizing: border-box;
`;

const FlexBox = (): RuleSet<object> => css`
    display: flex;
    justify-content: space-between;
`;

const Grid = (alignment: string = 'center'): RuleSet<object> => css`
    display: grid;
    align-items: ${alignment};
`;

// const BoxShadow = (xOffset: string = '0px', yOffset: string = '0px', blurRadius: string = '0px', spreadRadius: string = '0px', color: string = '#000'): RuleSet<object> => css`
//     box-shadow: ${xOffset} ${yOffset} ${blurRadius} ${spreadRadius} ${color};
// `;

const BreakPoint1 = (content:RuleSet<object>) => css` //1104px
    @media screen and (max-width: 69rem) {
        ${content}
    };
`;
const BreakPoint2 = (content:RuleSet<object>) => css` //1103.2px
    @media screen and (min-width: 68.95rem) {
        ${content}
    };
`;
const BreakPoint3 = (content:RuleSet<object>) => css` //896px
    @media screen and (min-width: 64rem) {
        ${content}
    };
`;
const BreakPoint4 = (content:RuleSet<object>) => css` //992px
    @media screen and (max-width: 56rem) {
        ${content}
    };
`;
const BreakPoint5 = (content:RuleSet<object>) => css` //848px
    @media screen and (max-width: 53rem) {
        ${content}
    };
`;

const BreakPoint6 = (content:RuleSet<object>) => css` //800px
    @media screen and (max-width: 50rem) {
        ${content}
    };
`;

const BreakPoint7 = (content:RuleSet<object>) => css` //512px
    @media screen and (max-width: 32rem) {
        ${content}
    };
`;

// const Button = (display: string = 'Block', boderRadius: string = '0px'): RuleSet<object> => css`
//     display: ${display};
//     border: none;
//     border-radius: ${boderRadius};
//     color: ${props => props.theme.colors.blackColor};
//     text-align: center;
//     padding: 8px 15px 8px 15px;
//     font-weight: 600;
// 	cursor: pointer;
// `;

const Avatar = (): RuleSet<object> => css`
    border-radius: 50px;
`;

export {
    Fonts,
    BoxSizing,
    FlexBox,
    Grid,
    // BoxShadow,
    BreakPoint1,
    BreakPoint2,
    BreakPoint3,
    BreakPoint4,
    BreakPoint5,
    BreakPoint6,
    BreakPoint7,
    // Button,
    Avatar
};