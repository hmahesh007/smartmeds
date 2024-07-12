# server
import datetime
from flask import Flask, jsonify, request, render_template, session, redirect, url_for, g, flash
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt

# requests
import os
import json
import requests
from datetime import datetime, timedelta
from pymongo import Client
from twilio.rest import Client
from pushsafer import init, Client
from tzlocal import get_localzone
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.errors import HttpError
from apscheduler.triggers.cron import CronTrigger

PORT = 5000

SCOPES = ['https://www.googleapis.com/auth/calendar']
flow = InstalledAppFlow.from_client_secrets_file("client_secret.json", scopes = SCOPES)
credentials = service_account.Credentials.from_service_account_file(
    '/Users/arnavdixit/Downloads/client_secret.json', 
    scopes=SCOPES
)
service = build('calendar', 'v3', credentials=credentials)

TWILIO_ACCOUNT_SID = '#SID'
TWILIO_AUTH_TOKEN = 'AUTH TOKEN'
TWILIO_PHONE_NUMBER = 'PHONE_NUM'

twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# app config
app = Flask(__name__, static_url_path='', static_folder='static')

app.secret_key = os.urandom(24)
app.config['MONGO_URI'] = #mongodb database 
bcrypt = Bcrypt(app)
mongo = PyMongo(app)

CORS(app, origins="http://localhost:3000", methods=["GET", "POST", "OPTIONS"])

@app.route('/sign_out', methods=["GET", "POST"])
def sign_out():
    session.pop('user', None)
    return jsonify({"success": "Sign out successful", "redirect": "/"})

@app.route('/user_meds', methods=['GET'])
def get_user_meds():
    if g.user is None:
        print("hm")
        return jsonify({"error": "User not logged in"}) 
    user = session['user']
    print(f"g.user: {g.user}")
    print(f"User from database: {user}")
    print("s")

    if user:
        print("g")
        user_meds = user.get("meds", [])
        if len(user_meds) == 0:
            return jsonify({"message": "No medications found for the user"})
        return jsonify(user_meds)
    
    print("what")

    return jsonify({"error": "User not found"}) 

@app.route('/sign_in', methods=["POST"])
def sign_in():
    if g.user is not None:
        return jsonify({"error": "User already signed in", "redirect": "/index"}),400

    inp_uname = request.form.get('email', None)
    inp_pass = request.form.get('pass', None)

    if inp_uname is None or inp_pass is None:
        return jsonify({"error": "Bad signin input"}),400

    # Check for user in MongoDB
    user = mongo.db.users.find_one({"email": inp_uname})    

    if user and bcrypt.check_password_hash(user["password"], inp_pass):
        session['user'] = inp_uname
        return jsonify({"success": "Sign in successful", "redirect": "/index"}), 200
        
    return jsonify({"error": "Bad login"}),400


@app.route("/index")
def index():
    err_msg = request.args.get('err_msg', '')
    print(err_msg)
    return render_template("index", usr=g.user, err_msg=err_msg)

@app.before_request
def before_request():
    g.user = None
    if 'user' in session:
        g.user = session['user']

@app.route('/signup', methods=['POST'])
def sign_up_page_render():
    if g.user is not None:
        return redirect('/index')

    inp_uname = request.form.get('name')
    inp_pass = request.form.get('password')
    inp_email = request.form.get('email')
    phone_num = request.form.get('phoneNumber')
    print(inp_uname)
    print("MongoDB connection status:", mongo.cx)


    if inp_uname is None or inp_pass is None or inp_email is None or len(inp_uname) < 5 or len(inp_pass) < 5:
        return redirect("/index?err_msg=bad signup input")

    # Check if username or email is already taken in MongoDB
    existing_user = mongo.db.users.find_one({"email": inp_email})

    if existing_user:
        if existing_user.get("email") == inp_email:
            return jsonify({"error": "email used"}), 400
            #return redirect("/index?err_msg=email used")

    # Add user to MongoDB
    hashed_password = bcrypt.generate_password_hash(inp_pass).decode('utf-8')
    user_data = {
        "name": inp_uname,
        "password": hashed_password,
        "email": inp_email,
        "phoneNumber": phone_num,
        "meds": []
    }
    mongo.db.users.insert_one(user_data)

    session['user'] = inp_uname
    return jsonify({"success": True}), 200
    #return redirect('/')

@app.route('/post_meds', methods=['GET'])
def med_list():
    if g.user is None:
        return redirect('/index')
    user = mongo.db.users.find_one({"uname": g.user})

    if user:
        prescriptions = user.get_data("meds", [])
        return render_template("add_med.html", usr=g.user, prescriptions=prescriptions)
    
    return redirect("/index?err_msg=email used")
              
@app.route('/add_med', methods=['POST'])
def add_med():
    if g.user is None:
        return redirect('/index')

    user = session['user']
    # mongo.db.users.find_one({"uname": g.user})

    data = request.get_json()
    
    #getting from front end
    med_name = data.get('medicineName')
    dose_quant = data.get('doseQuantity')
    day_repeat = data.get('days', [])
    start_time = data.get('startTime')
    repeat = data.get('repeat', {})
    times_a_day = repeat.get('timesADay', 1)
    every_hour = repeat.get('everyHour', 1)

    if med_name is None or dose_quant is None or day_repeat is None or every_hour is None or times_a_day is None or start_time is None:
        return redirect("/index?err_msg= bad_med_input")
    
    #creating new med object with given parameters
    new_med = {
        "name": med_name,
        "dose": dose_quant,
        "days": day_repeat,
        "hours": every_hour,
        "count_doses": times_a_day,
        "start": start_time, 
    }

    user_meds = user.get("meds", [])
    user_meds.append(new_med)
    
    #update mongoDb
    mongo.db.users.update_one({"_id": user["_id"]}, {"$set": {"meds": user_meds}})

    print(user.get("meds", []))

    # add_to_cal(new_med, user)

    return redirect("/index?success_msg=med_added") # success msg
    
    
        
@app.route('/remove_med', methods=['POST'])
def remove_signal():
    if g.user is None:
        return redirect('/index')

    med_name = request.json.get('med_name', None)

    if med_name is None:
        return jsonify({"error": "Bad request", "message": "Missing 'med_name' parameter"})

    response = remove_med(med_name)

    return jsonify(response)

def remove_med(med_name):
    if g.user is None:
        return redirect('/index')
    
    user = mongo.db.users.find_one({"uname": g.user})
    user_meds = user.get("meds", [])

    for m in user_meds:
        if m.get('name') == med_name:
            user_meds.remove(m)
            mongo.db.users.update_one({"_id": user["_id"]}, {"$set": {"meds": user_meds}}) #update mongoDb
            return redirect("/index?success_msg=med_remove_success") 
     

@app.route('calendar_view', methods=['POST'])
def cal_view(): #possibly delete
    if g.user is None:
        return jsonify({"error": "User not logged in"})
    
    user = users_collection.find_one({"uname": g.user})
    user_meds = user.get("meds", [])
    #loop this
    for m in user_meds:
        add_to_cal(m);


@app.route('/calendar_view', methods=['POST']) #might not need route
def add_to_cal(med, user): #called whenevere a new med is added
    start_dt = f"{datetime.now().date()} {med.get('start')}"

    start_t = datetime.strptime(start_dt, "%Y-%m-%d %H:%M:%S")

    formatted_days = [day.capitalize()[:2] for day in med.get("days")]
    
    for i  in range(med.get("count_doses")):
        start_time = start_t + timedelta(hours = i*med.get("hours"))
        #start_time = start_dt + timedelta(hours=i * med["hours"])

        end_time = start_time + timedelta(minutes=20)

        st = start_time.isoformat() + 'Z'
        et = end_time.isoformat() + 'Z'

        reminder_message = f"Take {med.get('dose')} pills of {med.get('name')} at {start_time.strftime('%H:%M')}"
        #reminder_message = f"Take {med['dose']} pills of {med['name']} at {start_time.strftime('%H:%M')}"

        reminder_time = start_time-timedelta(minutes=10)

        trigger = CronTrigger(day_of_week=','.join(med.get("days")), hour=reminder_time.strftime('%H'), minute=reminder_time.strftime('%M'))

        scheduler.add_job(send_scheduled_sms(user.get("phone number"), reminder_message), trigger)


        event = {
            'summary': f'Take {med.get("dose")} pills of {med.get("name")}',
            'description': f'Take {med.get("dose")} pills of {med.get("name")}',
            'start': {'dateTime': st, 'timeZone': 'UTC'},
            'end': {'dateTime': et, 'timeZone': 'UTC'},
            'recurrence': [f'RRULE:FREQ=WEEKLY;BYDAY={",".join(formatted_days)}'],
        }
        service.events().insert(calendarId="primary", body=event).execute()

    return jsonify({"success": "Calendar events created successfully"})  


@app.route('/send_reminder', methods=['GET'])
def send_web_notification(email, message, scheduled_time):
    try:
        if datetime.now() == scheduled_time:
            Client("").send_message(message, "Medication Reminder")
            return jsonify(f"Web notification sent: {message}")
    except Exception as e:
        return jsonify(f"Error sending web notification: {e}")

def send_sms_notification(phone_number, message):
    try:
        # Use the Twilio client to send an SMS
        twilio_client.messages.create(
            to=phone_number,
            from_=TWILIO_PHONE_NUMBER,
            body=message

            

        )
        return jsonify("SMS sent to {phone_number}: {message}")
    except Exception as e:
        return jsonify(f"Error sending SMS: {e}")


def send_reminders():
    if g.user is None:
        return jsonify({"error": "User not logged in"})

    user = users_collection.find_one({"uname": g.user})

    if not user:
        return redirect("/index?err_msg=email used")

    for medication in user.get("meds", []):

        
        dosage_time = 

        if dosage_time:
            time_difference = dosage_time - datetime.utcnow()

            if time_difference == timedelta(hours=2):
                reminder_message = f"Don't forget to take your medication: {medication.get('name')}"

                send_web_notification(mongo.db.users.find_one({"email": g.user}), reminder_message)
                send_sms_notification(mongo.db.users.find_one({"phone number": g.user}), reminder_message)

    return jsonify({"success": "Reminders sent successfully"})


if __name__ == '__main__':
    print('connected on port ' + str(PORT))
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=True
    )
