import React, { useContext } from 'react';
import { Form, Button, Container } from 'react-bootstrap';

import { ThemeContext } from '../../contexts/ThemeContext';

const UserContactForm = () => {
	const { getTheme } = useContext(ThemeContext);

	return ( 
		<Container className={"user-contact-page " + (getTheme())}>
			<Form action="mailto:paulina_wall@outlook.com" method="POST">
				<Form.Group controlId="exampleForm.ControlInput1">
					<Form.Label>Email address</Form.Label>
					<Form.Control type="email" placeholder="name@example.com" />
				</Form.Group>
				<Form.Group controlId="exampleForm.ControlInput1">
					<Form.Label>First Name</Form.Label>
					<Form.Control type="text" placeholder="Anna" />
				</Form.Group>
				<Form.Group controlId="exampleForm.ControlInput1">
					<Form.Label>Last Name</Form.Label>
					<Form.Control type="text" placeholder="Andersson" />
				</Form.Group>
				<Form.Group controlId="exampleForm.ControlTextarea1">
					<Form.Label>Example textarea</Form.Label>
					<Form.Control as="textarea" rows={6} />
				</Form.Group>
				<Button className="button" type="submit">
					Submit
				</Button>
			</Form>
		</Container>
	 );
}
 
export default UserContactForm;