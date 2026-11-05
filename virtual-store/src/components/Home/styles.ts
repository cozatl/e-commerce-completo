import styled from 'styled-components';

export const StyledHero = styled.section`
    width: 80%;
    margin: 20px auto;
    padding: 24px;
    text-align: center;
    border-radius: 10px;
    background: ${({ theme }) => theme.colors.bgMainDivColor};
    color: ${({ theme }) => theme.colors.whiteColor};
    h2 {
        font-size: 1.6rem;
        margin-bottom: 10px;
    }
    p {
        margin-bottom: 16px;
    }
    div {
        display: flex;
        gap: 16px;
        justify-content: center;
    }
    a {
        padding: 8px 18px;
        border-radius: 6px;
        background: ${({ theme }) => theme.colors.bgMenuColor};
        color: ${({ theme }) => theme.colors.whiteColor};
        text-decoration: none;
    }
`;
