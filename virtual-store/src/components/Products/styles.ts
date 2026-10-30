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

/** Card shared by the catalog and the home page preview. */
export const StyledProductCard = styled.article<{ $locked?: boolean }>`
    position: relative;
    display: grid;
    justify-items: center;
    text-align: center;
    img {
        opacity: ${({ $locked }) => ($locked ? 0.75 : 1)};
        object-fit: cover;
        aspect-ratio: 1 / 1;
    }
    a, button {
        cursor: pointer;
        padding: 6px 14px;
        border-radius: 6px;
        border: 1px solid ${({ theme }) => theme.colors.headerColor};
        background: ${({ theme }) => theme.colors.bgMenuColor};
        color: ${({ theme }) => theme.colors.whiteColor};
        text-decoration: none;
        font: inherit;
    }
    button:disabled {
        cursor: not-allowed;
        background: ${({ theme }) => theme.colors.btnDisabledColor};
    }
`;

export const StyledBadge = styled.span`
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 0.75rem;
    background: ${({ theme }) => theme.colors.avatarColor};
    color: ${({ theme }) => theme.colors.blackColor};
`;

export const StyledPrice = styled.p`
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    del {
        opacity: 0.6;
    }
`;

export const StyledPager = styled.nav`
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: center;
    padding: 20px;
    button {
        cursor: pointer;
        padding: 6px 14px;
        border-radius: 6px;
        border: none;
        background: ${({ theme }) => theme.colors.bgMenuColor};
        color: ${({ theme }) => theme.colors.whiteColor};
        font: inherit;
    }
    button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`;

export const StyledCategoryFilter = styled.div`
    width: 80%;
    margin: 20px auto 0;
    display: flex;
    gap: 10px;
    align-items: center;
    select {
        padding: 6px 10px;
        border-radius: 6px;
        font: inherit;
    }
`;
