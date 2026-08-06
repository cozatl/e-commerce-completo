import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const NavLinks = styled.ul`
  list-style: none;
  gap: 1.5rem;
  width: 100%;
  //z-index: 10;
    background: linear-gradient(#473a3a, #222);
`;

// Target external NavLink component with styled() wrapper
const StyledNavLink = styled(NavLink)`
  text-decoration: none;

  display: block;
  padding: 10px 15px;
  text-decoration: none;
  color: #fff;
  background: linear-gradient(#000, #222);
  border-bottom: 1px solid #ddd;
  &.active {
    color: #00bcd4;
    font-weight: bold;
  }
  &:hover {
    background: linear-gradient(#222, #5f4141);
  }
`;

export {
    NavLinks,
    StyledNavLink,
};