import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const AppNavbar = () => {
  return (
    <Navbar expand="lg" variant="dark" bg="dark" sticky="top" className="shadow">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>Dept Dashboard</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <LinkContainer to="/departments">
              <Nav.Link>Departments</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/performance">
              <Nav.Link>Performance</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/status">
              <Nav.Link>Status Updates</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/allocation">
              <Nav.Link>Allocations</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/complaints">
              <Nav.Link>Complaints</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/feedbacks">
              <Nav.Link>Feedbacks</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/users">
              <Nav.Link>Users</Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
