# Animal Danger Assessment

This Encode student project is a web application that allows users to upload images of animals to determine if they are dangerous. The application uses a TensorFlow machine learning model for image classification and a backend AI Agent that assesses the danger level of the detected animal.

## Features

- Upload an image of an animal.
- Detect the type of animal using TensorFlow's MobileNet model.
- Assess whether the detected animal is dangerous using a backend service.
- Display the rationale for the danger assessment.

## Prerequisites

- Node.js and npm
- Python 3.10 (TensorFlow is not compatible with versions past 3.10)
- Git

## Setup Instructions

### 1. Clone the Repository
git clone https://github.com/your-username/animal-danger-assessment.git

### 2. Install Frontend Packages
npm install

### 3. Install Backend Packages
Navigate to the `backend` directory and create a virtual environment:
cd ../backend
python3.11 -m venv venv
source venv/bin/activate # On Windows use venv\Scripts\activate

Install the required Python packages:
pip install -r requirements.txt

### 4. Set Up Environment Variables
Create a `.env` file in the `backend` directory and add the following environment variables:
OPENAI_API_KEY=your_openai_api_key

### 5. Run the Application

#### Start the Backend Server
In the `backend` directory, run:
uvicorn server:app --reload --port 8000

#### Start the Frontend Server
npm run dev

### 6. Access the Application

- Frontend: Open your browser and go to `http://localhost:3000`
- Backend: The backend server runs on `http://localhost:8000`

## Usage

1. Open the frontend in your browser.
2. Upload an image of an animal using the "Upload Image" button.
3. The application will display the detected animal and assess whether it is dangerous.
4. View the rationale for the danger assessment.

## Notes

- Ensure that your Python version is 3.10 or lower, as TensorFlow is not compatible with versions past 3.10.
- The frontend runs on `localhost:3000` and the backend runs on `localhost:8000`.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements.

## License

This project is licensed under the MIT License.

