import React, { useState } from 'react';

interface PrescriptionFormData {
  medicineName: string;
  doseQuantity: number;
  days: {
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
    sun: boolean;
  };
  startTime: string;
  repeat: {
    timesADay: number;
    everyHour: number;
  };
}

const PrescriptionForm = () => {
  const [formData, setFormData] = useState<PrescriptionFormData>({
    medicineName: '',
    doseQuantity: 1,
    days: {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false,
    },
    startTime: '',
    repeat: {
      timesADay: 1,
      everyHour: 1,
    },
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target;
    if (type === 'checkbox') {
      // Handle checkbox change
      setFormData((prevFormData) => ({
        ...prevFormData,
        days: {
          ...prevFormData.days,
          [name]: !prevFormData.days[name as keyof typeof prevFormData.days],
        },
      }));
    } else {
      // Handle other input changes
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: type === 'number' ? Number(value) : value,
      }));
    }
  };

  const handleRepeatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      repeat: {
        ...prevFormData.repeat,
        [name]: Number(value),
      },
    }));
  };




  // const handleSubmit = (event: React.FormEvent) => {
  //   event.preventDefault();
  //   // The startTime is already in 24-hour format as required by the backend
  //   const submitData = {
  //     ...formData,
  //     startTime: formData.startTime, // No need to append ":00" for seconds

  //   };
  //   console.log('Form Data Submitted:', submitData);
  //   // TODO: Send submitData to your Flask backend here

  // };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const submitData = {
      ...formData,
      days: Object.entries(formData.days)
      .filter(([_, value]) => value)
      .map(([key, _]) => key),
      repeat: {
        timesADay: formData.repeat.timesADay,
        everyHour: formData.repeat.everyHour,
      }
    };
    try {
      const response = await fetch('/add_med', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      console.log(response);
  
      if (!response.ok) {
        console.error(`Error: ${response.status} - ${response.statusText}`);
        throw new Error('Network response was not ok');
      }
  
    } catch (error) {
      console.error('There was a problem with your fetch operation:', error);
    }
  };






  // Generate checkboxes for days
  const dayCheckboxes = Object.keys(formData.days).map((day) => (
    <label key={day}>
      {day}
      <input
        type="checkbox"
        name={day}
        checked={formData.days[day as keyof typeof formData.days]}
        onChange={handleInputChange}
      />
    </label>
  ));

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Medicine name:
        <input
          type="text"
          name="medicineName"
          value={formData.medicineName}
          onChange={handleInputChange}
        />
      </label>
      <br />
      <label>
        Dose quantity:
        <input
          type="number"
          name="doseQuantity"
          value={formData.doseQuantity}
          onChange={handleInputChange}
          min={1}
        />
      </label>
      <br />
      <fieldset>
        <legend>Days:</legend>
        {dayCheckboxes}
      </fieldset>
      <label>
        Start Time (HH:MM):
        <input
          type="time"
          name="startTime"
          value={formData.startTime}
          onChange={handleInputChange}
        />
      </label>
      <br />
      <fieldset>
        <legend>Repeat:</legend>
        <label>
          Times a day:
          <input
            type="number"
            name="timesADay"
            value={formData.repeat.timesADay}
            onChange={handleRepeatChange}
            min={1}
            max={23}
          />
        </label>
        <br />
        <label>
          Every hour:
          <input
            type="number"
            name="everyHour"
            value={formData.repeat.everyHour}
            onChange={handleRepeatChange}
            min={1}
            max={23}
          />
        </label>
      </fieldset>
      <br />
      <button type="submit">Submit</button>
    </form>
  );
};

export default PrescriptionForm;