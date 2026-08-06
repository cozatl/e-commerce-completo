import styled, { css } from 'styled-components';
import { BoxSizing, BreakPoint1, BreakPoint2, BreakPoint3, BreakPoint5, Fonts, Grid } from '../Theme/mixins';

const StyledSectionProducts = styled.section`
    width: 80%; /* if we put fixed value, then products won't adapt to screen size, percentage skips that error it works with grid columns auto-fit value */
    margin: 0 auto;
    padding: 20px;
    gap: 20px;
    ${BoxSizing};
    ${Grid('center')};
    justify-items: center;
    h3 {
        cursor: pointer;
        /* Approximately 1.1rem=18.4px *** 1.7vw=18.3px-17.7px *** 1.1rem = 17.6px */
        ${Fonts({minSize: '1.1rem', prefValue: '1.7vw', maxSize: '1.15rem'})}
        font-weight: ${props => props.theme.fonts.weights.medium};
        margin-bottom: 5px;
        ${BreakPoint2(css`
            padding: 0 10px;
        `)};
    }
    article {        
        justify-items: center;
        text-align: center;
        p {
            cursor: pointer;
            margin-bottom: 10px;
            /* Approximately 1.1rem=18.4px *** 1.7vw=18.3px-17.7px *** 1.1rem = 17.6px */
            ${Fonts({minSize: '1.1rem', prefValue: '1.7vw', maxSize: '1.15rem'})}
            font-weight: ${props => props.theme.fonts.weights.light};
            ${BreakPoint2(css`
                padding: 0 10px;
            `)};
        }
    }

    img {
        cursor: pointer;
        ${BreakPoint1(css`
            width: 150px;
        `)};
        ${BreakPoint2(css`
            width: 100%;
            max-width: 200px; /* try to reach 100% but not more than 200px */
            margin-bottom: 10px;
        `)};
    }

    ${BreakPoint3(css`
        grid-template-columns: repeat(auto-fit, minmax(200px,1fr));
    `)};
    ${BreakPoint5(css`
        grid-template-columns: 1fr;
        padding: 10px;
    `)};
`;

export {
    StyledSectionProducts,
};