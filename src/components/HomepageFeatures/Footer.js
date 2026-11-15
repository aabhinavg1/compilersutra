// src/homepagefeature/Footer.js
import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  padding: 40px 20px;
  background-color: #333;
  color: #fff;
  text-align: center;
  font-size: 0.875rem;
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
`;

const FooterLink = styled.a`
  color: #ddd;
  text-decoration: none;
  &:hover {
    color: #fff;
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <p>&copy; 2024 Compiler Education for All. All rights reserved.</p>
      <FooterLinks>
        <FooterLink href="/about_us/">
          About Us
        </FooterLink>
        <FooterLink href="https://www.linkedin.com/in/abhinavcompilerllvm/">Contact</FooterLink>
        <FooterLink href="https://github.com/sponsors/aabhinavg1">Support</FooterLink>
      </FooterLinks>
    </FooterContainer>
  );
};

export default Footer;
