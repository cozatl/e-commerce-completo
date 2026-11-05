import styled, { css } from 'styled-components';
import { BoxSizing, BreakPoint6 } from '../Theme/mixins';

/** Centered column used by checkout, orders and addresses pages. */
const StyledPage = styled.section`
    ${BoxSizing()};
    width: 70%;
    margin: 0 auto 40px;
    padding: 25px;
    color: #fff;
    display: grid;
    gap: 20px;
    h2 {
        margin: 0;
    }
    ${BreakPoint6(css`
        width: 100%;
        padding: 15px;
    `)};
`;

const StyledPanel = styled.div`
    ${BoxSizing()};
    border: 1px solid #999;
    border-radius: 7px;
    padding: 15px 20px;
    display: grid;
    gap: 10px;
    h3 {
        margin: 0 0 5px;
        font-size: 1rem;
    }
`;

/** Label / amount rows (subtotal, shipping, total...). */
const StyledTotals = styled.dl`
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 6px 20px;
    margin: 0;
    dt { opacity: .85; }
    dd { margin: 0; text-align: right; }
    .total { font-weight: 600; font-size: 1.1rem; }
    .muted { opacity: .65; font-size: .85rem; }
`;

const StyledItemRow = styled.li`
    display: flex;
    justify-content: space-between;
    gap: 15px;
    padding: 6px 0;
    border-bottom: 1px solid #444;
    list-style: none;
`;

const StyledList = styled.ul`
    margin: 0;
    padding: 0;
`;

const StyledFormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    label {
        display: grid;
        gap: 4px;
        font-size: 13px;
    }
    .wide { grid-column: 1 / -1; }
    input, select, textarea {
        padding: 10px;
        box-sizing: border-box;
        border: 1px solid #999;
        border-radius: 5px;
        width: 100%;
        font: inherit;
    }
    ${BreakPoint6(css`
        grid-template-columns: 1fr;
    `)};
`;

const StyledActions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
`;

const StyledBadge = styled.span<{ $status: string }>`
    display: inline-block;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: .8rem;
    background: ${({ $status }) => {
        switch ($status) {
            case 'paid':
            case 'shipped':
            case 'delivered':
                return '#2f6b3f';
            case 'pending_payment':
                return '#8a6d1f';
            default:
                return '#555';
        }
    }};
`;

const StyledNotice = styled.p`
    margin: 0;
    padding: 10px 14px;
    border-radius: 5px;
    background: #2a2d3a;
    font-size: .9rem;
`;

export {
    StyledActions,
    StyledBadge,
    StyledFormGrid,
    StyledItemRow,
    StyledList,
    StyledNotice,
    StyledPage,
    StyledPanel,
    StyledTotals,
};
