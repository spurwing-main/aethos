import requests
import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import argparse

# Load environment variables from .env file
load_dotenv()

# --- Brands Configuration (loaded from environment variables) ---
BRANDS = [
    {
        "name": "Aethos Saragano",
        "brand_id": os.getenv("AETHOS_SARAGANO_BRAND_ID"),
        "secret": os.getenv("AETHOS_SARAGANO_SECRET"),
    },
    {
        "name": "Aethos Ericeira",
        "brand_id": os.getenv("AETHOS_ERICEIRA_BRAND_ID"),
        "secret": os.getenv("AETHOS_ERICEIRA_SECRET"),
    },
    {
        "name": "Aethos Monterosa",
        "brand_id": os.getenv("AETHOS_MONTEROSA_BRAND_ID"),
        "secret": os.getenv("AETHOS_MONTEROSA_SECRET"),
    },
    {
        "name": "Aethos Sardinia",
        "brand_id": os.getenv("AETHOS_SARDINIA_BRAND_ID"),
        "secret": os.getenv("AETHOS_SARDINIA_SECRET"),
    },
    {
        "name": "Aethos Milan",
        "brand_id": os.getenv("AETHOS_MILAN_BRAND_ID"),
        "secret": os.getenv("AETHOS_MILAN_SECRET"),
    },
    {
        "name": "Aethos Mallorca",
        "brand_id": os.getenv("AETHOS_MALLORCA_BRAND_ID"),
        "secret": os.getenv("AETHOS_MALLORCA_SECRET"),
    },
    {
        "name": "Aethos London Shoreditch",
        "brand_id": os.getenv("AETHOS_LONDON_BRAND_ID"),
        "secret": os.getenv("AETHOS_LONDON_SECRET"),
    },
]


def get_listing_sessions(listing_id, brand_name, from_date, to_date):
    """
    Fetches session availability for a specific listing.
    """
    # Find the brand credentials
    brand = next((b for b in BRANDS if b["name"].lower() == brand_name.lower()), None)
    if not brand or not brand["brand_id"] or not brand["secret"]:
        print(
            f"❌ Error: Brand '{brand_name}' not found or credentials missing in .env file."
        )
        return

    # Construct the URL and headers
    url = f"https://api.letsway.com/v1/listings/{listing_id}/sessions"
    headers = {
        "Accept": "application/json",
        "Way-Brand-Id": brand["brand_id"],
        "Way-Secret-Key": brand["secret"],
    }
    querystring = {"from": from_date, "to": to_date}

    print(f"🔍 Fetching sessions for listing: {listing_id}")
    print(f"   Brand: {brand['name']}")
    print(f"   Date Range: {from_date} to {to_date}\n")

    try:
        response = requests.get(url, headers=headers, params=querystring, timeout=30)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)

        # Pretty-print the JSON response
        print(json.dumps(response.json(), indent=2))

    except requests.exceptions.HTTPError as http_err:
        print(f"❌ HTTP Error: {http_err}")
        print(f"   Response: {response.text}")
    except requests.exceptions.RequestException as req_err:
        print(f"❌ Request Error: {req_err}")
    except json.JSONDecodeError:
        print("❌ Error: Failed to decode JSON from response.")
        print(f"   Response: {response.text}")


if __name__ == "__main__":
    # --- Argument Parsing ---
    parser = argparse.ArgumentParser(
        description="Check session availability for a specific Way listing."
    )

    parser.add_argument("listing_id", help="The UUID of the listing to check.")

    parser.add_argument(
        "-b",
        "--brand",
        required=True,
        help="The name of the brand to use for API authentication (e.g., 'Aethos Ericeira').",
    )

    # Default dates
    default_from = datetime.now().strftime("%Y-%m-%d")
    default_to = (datetime.now() + timedelta(days=21)).strftime("%Y-%m-%d")

    parser.add_argument(
        "--from",
        dest="from_date",
        default=default_from,
        help=f"Start date in YYYY-MM-DD format. (Default: {default_from})",
    )

    parser.add_argument(
        "--to",
        dest="to_date",
        default=default_to,
        help=f"End date in YYYY-MM-DD format. (Default: {default_to})",
    )

    args = parser.parse_args()

    get_listing_sessions(args.listing_id, args.brand, args.from_date, args.to_date)
