# Docker Manager

This project was created to help the company in the management of the dockers' personnel. It allows the registration, the access control and the follow-up of the work done daily on the terminal.

Done with HTML, CSS, Javascript, React, MongoDB, Express, NodeJs

- A user account must be created and the user must be logged in to perform actions
- User profiles are supervisor and administrator
- A supervisor can create a docker using information such as name, phone number, photo, ID number and fingerprint
- A supervisor can search for a docker using the name or the ID number
- A supervisor can create a shift by filling in information such as the type (day/night) and the date, and register the dockers working during this shift
- A supervisor can search for a shift using a date
- A supervisor can register an interruption during a shift by filling in the start time, the end time and a description, before selecting the dockers affected by this downtime
- A supersvisor can close a shift by entering for each docker who worked the type of operation performed, the position occupied and a description if necessary
- An administrator can consult dashboard/statictics and perform all the actions of a supervisor
