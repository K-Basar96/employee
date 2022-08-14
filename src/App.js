import { useState } from 'react';
import './App.css';
import FormInput from './Components/FormInput';

function App() {
	const [values, setValues] = useState({
		emp_id: '',
		first_name: '',
		last_name: '',
		email: '',
		phone: '',
	});
	const inputs = [
		{
			id: 1,
			name: 'emp_id',
			type: 'text',
			placeholder: 'Employee id',
			errorMessage: 'use only capital letter and numbers,',
			pattern: '^[A-Z 0-9 ^-s]{6}$',
			label: 'Employee id',
			required: true,
		},
		{
			id: 2,
			name: 'first_name',
			type: 'text',
			placeholder: 'First name',
			errorMessage:
				"First name shouldn't conatin any number or special chararcter!",
			// pattern: '^[A-Z a-z]{2,20}$',
			pattern: '^[A-Za-z0-9]{0,20}$',
			label: 'First name',
			required: true,
		},
		{
			id: 3,
			name: 'last_name',
			type: 'text',
			placeholder: 'Last name',
			errorMessage:
				"Last name shouldn't conatin any number or special chararcter!",
			pattern: '^[A-Za-z]{2,20}$',
			label: 'Last name',
			required: true,
		},
		{
			id: 4,
			name: 'email',
			type: 'email',
			placeholder: 'Email Address',
			errorMessage: 'enter a valid email address!',
			label: 'Email Address',
			required: true,
		},
		{
			id: 5,
			name: 'phone',
			type: 'text',
			placeholder: 'phone number',
			errorMessage: 'enter a valid phone number!',
			pattern: '^[0-9]{10}$',
			label: 'phone number',
			required: true,
		},
	];

	let handleSubmit = (e) => {
		e.preventdefault();
	};
	const onChange = (e) => {
		setValues({ ...values, [e.target.name]: e.target.value });
	};

	return (
		<div className='App'>
			<form onSubmit={handleSubmit}>
				<h1>Employee Details</h1>
				{inputs.map((input) => (
					<FormInput
						key={input.id}
						{...input}
						value={values[input.name]}
						onChange={onChange}
					/>
				))}
				<button>ADD</button>
			</form>
		</div>
	);
}

export default App;
