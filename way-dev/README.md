# Way API Listings Checker

A Python tool for testing the consistency and reliability of the Way API listings endpoint across multiple Aethos hotel brands.

## Overview

This tool performs multiple API calls to the Way listings endpoint for each configured hotel brand, checking for:

- Response consistency across multiple runs
- API response times and reliability
- Data integrity and completeness
- Proper handling of pagination

## Features

- ✅ **Consistency Testing**: Compares API responses using SHA256 hashes to detect data inconsistencies
- 📊 **Item Counting**: Shows actual items returned vs. total items reported by the API
- 💾 **Response Logging**: Saves all API responses as timestamped JSON files
- 🔐 **Secure Configuration**: Uses environment variables for API credentials
- 🎯 **Single Brand Mode**: Toggle to test just one brand for faster development
- 📈 **Detailed Reporting**: Clear terminal output showing success/failure states

## Setup

### 1. Virtual Environment

```bash
# Create virtual environment (if not already created)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate     # On Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual API credentials:

   ```bash
   # Open .env and replace placeholder values with real API keys
   nano .env
   ```

   The file should contain your actual brand IDs and secret keys for each Aethos property.

## Usage

### Basic Usage

Run tests for all brands:

```bash
python way_listings_check.py
```

### Single Brand Testing

For faster development/debugging, you can test just the first brand:

1. Edit `way_listings_check.py`:

   ```python
   # Change this line near the top of the file
   TEST_SINGLE_BRAND = True
   ```

2. Run the script:
   ```bash
   python way_listings_check.py
   ```

### Configuration Options

Edit the configuration section in `way_listings_check.py`:

```python
# === CONFIGURATION ===
BASE_URL = "https://api.letsway.com/v2/listings?limit=500"
TEST_SINGLE_BRAND = False  # Set to True for single brand testing
RUNS_PER_BRAND = 3         # Number of test runs per brand
DELAY = 1                  # Seconds between API calls
OUTPUT_DIR = "listings_output"  # Directory for JSON output files
```

## Output

### Terminal Output

```
🔍 Testing all 7 brands

=== Testing Aethos Saragano (17f6a667-238e-4e1f-bbd3-3a1925370de5) ===
Run 1: 200 - 20 items returned of total 20 items
  → hash: a1b2c3d4e5f6...
  💾 Saved to: listings_output/Aethos_Saragano_run1_20251017_143022.json
Run 2: 200 - 20 items returned of total 20 items
  → hash: a1b2c3d4e5f6...
  💾 Saved to: listings_output/Aethos_Saragano_run2_20251017_143025.json
Run 3: 200 - 20 items returned of total 20 items
  → hash: a1b2c3d4e5f6...
  💾 Saved to: listings_output/Aethos_Saragano_run3_20251017_143028.json
✅ Listings are consistent across runs.
```

### JSON Output Files

Each API response is saved to `listings_output/` with metadata:

```json
{
  "brand": "Aethos Saragano",
  "brand_id": "17f6a667-238e-4e1f-bbd3-3a1925370de5",
  "run_number": 1,
  "timestamp": "2024-10-17T14:30:22.123456",
  "status_code": 200,
  "data": {
    "items": [...],
    "meta": {...}
  },
  "error": null
}
```

## API Endpoint

**URL**: `https://api.letsway.com/v2/listings`

**Headers**:

- `Accept: application/json`
- `Way-Brand-Id: {brand_id}`
- `Way-Secret-Key: {secret_key}`

**Parameters**:

- `limit=500` (to ensure all listings are returned in one call)

## Brands Tested

The tool tests the following Aethos properties:

1. **Aethos Saragano** (Tuscany, Italy)
2. **Aethos Ericeira** (Portugal)
3. **Aethos Monterosa** (Italian Alps)
4. **Aethos Sardinia** (Italy)
5. **Aethos Milan** (Italy)
6. **Aethos Mallorca** (Spain)
7. **Aethos London Shoreditch** (UK)

## Troubleshooting

### Missing Environment Variables

```
ValueError: Missing environment variables for Aethos Saragano
```

**Solution**: Check that your `.env` file contains all required variables and has been saved properly.

### Import Error

```
ModuleNotFoundError: No module named 'dotenv'
```

**Solution**: Ensure your virtual environment is activated and run `pip install -r requirements.txt`.

### API Authentication Errors

```
Run 1: 401
⚠️ Non-200 response: Unauthorized
```

**Solution**: Verify your API credentials in the `.env` file are correct and up-to-date.

### Inconsistent Listings Warning

```
⚠️ Inconsistent listings across runs!
```

**Investigation**:

1. Check the saved JSON files for differences
2. Look for timestamp-sensitive data
3. Verify if the API has caching issues
4. Consider if this is expected behavior (e.g., real-time inventory)

## File Structure

```
way-dev/
├── README.md                 # This file
├── way_listings_check.py     # Main script
├── requirements.txt          # Python dependencies
├── .env                      # API credentials (not in git)
├── .env.example             # Template for credentials
├── .gitignore               # Git ignore rules
└── listings_output/         # API response JSON files
    ├── Aethos_Saragano_run1_20251017_143022.json
    ├── Aethos_Ericeira_run1_20251017_143025.json
    └── ...
```

## Security Notes

- ⚠️ **Never commit `.env`** - it contains sensitive API credentials
- ✅ **Use `.env.example`** for sharing configuration templates
- 🔒 **API keys are loaded from environment variables** - keep them secure
- 📁 **JSON output files may contain sensitive data** - review before sharing

## Development

### Adding New Brands

1. Add environment variables to `.env`:

   ```env
   NEW_BRAND_BRAND_ID=your_brand_id
   NEW_BRAND_SECRET=your_secret_key
   ```

2. Add to the BRANDS list in `way_listings_check.py`:
   ```python
   {
       "name": "New Brand Name",
       "brand_id": os.getenv("NEW_BRAND_BRAND_ID"),
       "secret": os.getenv("NEW_BRAND_SECRET"),
   },
   ```

### Modifying Test Parameters

- **Change number of runs**: Modify `RUNS_PER_BRAND`
- **Adjust API timeout**: Modify the timeout in `get_listings()`
- **Change delay between calls**: Modify `DELAY`
- **Increase page size**: Modify the `limit` parameter in `BASE_URL`

## Contributing

1. Ensure your changes don't expose API credentials
2. Test with `TEST_SINGLE_BRAND = True` first
3. Update this README if adding new features
4. Check that `.gitignore` properly excludes sensitive files
