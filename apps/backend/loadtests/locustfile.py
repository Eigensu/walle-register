"""Load test for the registration backend (Locust).

Run ONLY against a local or staging backend with a throwaway MongoDB database.
It creates real Player rows and never touches the payment gateways.

Headless:
  uv run --with locust locust -f loadtests/locustfile.py --host http://localhost:8000 \
      --headless -u 50 -r 5 -t 2m --csv loadtests/out
Web UI:
  uv run --with locust locust -f loadtests/locustfile.py --host http://localhost:8000

Notes:
- The registration cap (default 174) will return 403 once reached. Raise
  registration_cap in the test DB's AppConfig first, or treat 403 as expected.
- Emails/phones/Aadhaar are unique per request to avoid 409 duplicates.
"""
import base64
import random
import uuid

from locust import HttpUser, between, task

# 1x1 PNG
PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
)


def new_form():
    n = uuid.uuid4().int
    phone = "9" + str(n)[:9]
    return {
        "first_name": "Load",
        "last_name": f"Test{n % 100000}",
        "email": f"load-{uuid.uuid4().hex[:12]}@example.com",
        "phone": phone,
        "residential_area": "Test Area",
        "firm_name": "Test Firm",
        "designation": "Tester",
        "aadhar_number": str(n)[:12].ljust(12, "1"),
        "city": "Jamnagar",
        "village": "",
        "batting_type": "Right-hand",
        "bowling_type": random.choice(["right_arm", "left_arm", "none"]),
        "wicket_keeper": "No",
        "name_on_jersey": "LOAD",
        "tshirt_size": "M",
        "waist_size": "32",
        "played_JMCL_S2": "No",
        "JMCL_S2_team": "",
    }


class Visitor(HttpUser):
    """Mostly browsing: the registration page polls /api/config."""
    weight = 8
    wait_time = between(1, 4)

    @task
    def config(self):
        self.client.get("/api/config", name="GET /api/config")


class Registrant(HttpUser):
    """Full registration: config -> register -> view details -> resume payment."""
    weight = 2
    wait_time = between(2, 6)

    @task
    def register_flow(self):
        self.client.get("/api/config", name="GET /api/config")
        form = new_form()
        files = {"photo": ("photo.png", PNG, "image/png")}
        with self.client.post("/api/register", data=form, files=files,
                              name="POST /api/register", catch_response=True) as r:
            if r.status_code == 403:      # cap reached / closed: expected, not a failure
                r.success()
                return
            if r.status_code != 200:
                r.failure(f"{r.status_code}: {r.text[:200]}")
                return
            pid = r.json()["player_id"]
        self.client.get(f"/api/player/{pid}", name="GET /api/player/[id]")
        self.client.post("/api/resume-payment", json={"email": form["email"]},
                         name="POST /api/resume-payment")
