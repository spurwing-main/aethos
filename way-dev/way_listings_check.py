import requests
import hashlib
import json
import time
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# === CONFIGURATION ===
BASE_URL = "https://api.letsway.com/v2/listings?limit=500"

# Toggle: Set to True to test only first brand, False to test all brands
TEST_SINGLE_BRAND = False

# List of brands and their API keys (loaded from environment variables)
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

# Validate that all environment variables are loaded
for brand in BRANDS:
    if not brand["brand_id"] or not brand["secret"]:
        raise ValueError(f"Missing environment variables for {brand['name']}")

# Number of test runs per brand
RUNS_PER_BRAND = 3

# Timeout between calls (seconds)
DELAY = 1

# Output directory for JSON files
OUTPUT_DIR = "listings_output"


def get_listings(brand):
    headers = {
        "Accept": "application/json",
        "Way-Brand-Id": brand["brand_id"],
        "Way-Secret-Key": brand["secret"],
    }
    r = requests.get(BASE_URL, headers=headers, timeout=30)
    return r


def hash_response(json_data):
    """Return a hash of the response (ignoring ordering differences)."""
    normalized = json.dumps(json_data, sort_keys=True)
    return hashlib.sha256(normalized.encode()).hexdigest()


def save_response(brand, run_number, data, status_code):
    """Save the API response to a JSON file."""
    # Create output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Create a safe filename from brand name
    safe_brand_name = brand["name"].replace(" ", "_").replace("/", "_")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    filename = f"{safe_brand_name}_run{run_number}_{timestamp}.json"
    filepath = os.path.join(OUTPUT_DIR, filename)

    # Prepare data to save
    output_data = {
        "brand": brand["name"],
        "brand_id": brand["brand_id"],
        "run_number": run_number,
        "timestamp": datetime.now().isoformat(),
        "status_code": status_code,
        "data": data if status_code == 200 else None,
        "error": data if status_code != 200 else None,
    }

    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        print(f"  💾 Saved to: {filepath}")
    except Exception as e:
        print(f"  ❌ Failed to save file: {e}")


def main():
    print(f"Output directory: {OUTPUT_DIR}")

    # Select brands to test based on toggle
    brands_to_test = [BRANDS[0]] if TEST_SINGLE_BRAND else BRANDS

    if TEST_SINGLE_BRAND:
        print(f"🔍 Testing single brand mode: {brands_to_test[0]['name']}")
    else:
        print(f"🔍 Testing all {len(brands_to_test)} brands")

    for brand in brands_to_test:
        print(f"\n=== Testing {brand['name']} ({brand['brand_id']}) ===")

        hashes = []
        for i in range(RUNS_PER_BRAND):
            try:
                resp = get_listings(brand)

                if resp.status_code == 200:
                    data = resp.json()
                    digest = hash_response(data)
                    hashes.append(digest)

                    # Get actual item count from response (count the items)
                    # The structure is: response.data.items (not response.data.data.items)
                    actual_items = len(data.get("items", []))
                    # Get the API's reported total
                    reported_total = data.get("meta", {}).get("totalItems", "unknown")

                    print(
                        f"Run {i+1}: {resp.status_code} - {actual_items} items returned of total {reported_total} items"
                    )
                    print(f"  → hash: {digest[:12]}…")
                    save_response(brand, i + 1, data, resp.status_code)
                else:
                    error_data = resp.text
                    print(f"Run {i+1}: {resp.status_code}")
                    print("  ⚠️  Non-200 response:", error_data[:200])
                    save_response(brand, i + 1, error_data, resp.status_code)
            except Exception as e:
                print(f"Run {i+1}: ERROR - {e}")
                save_response(brand, i + 1, str(e), 0)

            time.sleep(DELAY)

        if len(set(hashes)) == 1 and hashes:
            print("✅ Listings are consistent across runs.")
        elif len(hashes) > 1:
            print("⚠️ Inconsistent listings across runs!")
            for h in hashes:
                print("  ", h)
        else:
            print("❌ No successful responses.")


if __name__ == "__main__":
    main()
