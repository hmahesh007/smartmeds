import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


interface Medication {
  name: string;
  dose: string;
  days: string[];
}

const PrescriptionList: React.FC = () => {
  const [meds, setMeds] = useState<Medication[]>([]);

  useEffect(() => {
    fetch('/user_meds')
        .then((response) => {
            if (!response.ok) {
                console.log("hello");
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => setMeds(data))
        .catch((error) => console.error('Error fetching data:', error));
}, []);

  const navigate = useNavigate();


  const handleAddMedButtonClick = () => {
    // Use the navigate function to redirect to the "add_med" route
    navigate('/add_med');
  };

  const handleRemoveMedButtonClick = () => {
    // Use the navigate function to redirect to the "remove_med" route
    navigate('/remove_med');
  };

  return (
    <div>
      <h2>Prescriptions</h2>
      <ul>
        {meds.map((med) => (
          <li key={med.name}>
            <strong>{med.name}</strong> - Dose: {med.dose}, Days: {med.days.join(', ')}
            <Link to={`/remove_med/${med.name}`}>
              <button>Remove Medicine</button>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/add_med">
        <button>Add Medicine</button>
      </Link>
    </div>
  );
};


export default PrescriptionList;
