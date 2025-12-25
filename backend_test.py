import requests
import sys
import json
import base64
from datetime import datetime
from io import BytesIO
from PIL import Image

class CrowntimeAPITester:
    def __init__(self, base_url="https://crown-valuer.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers=headers, timeout=60)
                else:
                    headers['Content-Type'] = 'application/json'
                    response = requests.post(url, json=data, headers=headers, timeout=60)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
                    return True, response_data
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:500]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def create_test_image(self):
        """Create a simple test image in base64 format"""
        # Create a simple 100x100 test image with some visual features
        img = Image.new('RGB', (100, 100), color='white')
        # Add some visual features - a simple pattern
        pixels = img.load()
        for i in range(100):
            for j in range(100):
                if (i + j) % 20 < 10:
                    pixels[i, j] = (100, 150, 200)  # Light blue
                else:
                    pixels[i, j] = (200, 200, 200)  # Light gray
        
        # Convert to bytes
        buffer = BytesIO()
        img.save(buffer, format='JPEG')
        buffer.seek(0)
        return buffer.getvalue()

    def test_valuate_text_only(self):
        """Test valuation with text-only input"""
        form_data = {
            'brand': 'Rolex',
            'model': 'Submariner',
            'reference': '116610LN',
            'year': '2018',
            'case_size': '40mm',
            'case_material': 'Stainless Steel',
            'bezel_type': 'Ceramic',
            'dial_description': 'Black',
            'bracelet_strap': 'Oyster Bracelet',
            'condition': 'Excellent',
            'box_papers': 'Full Set',
            'modifications': 'None',
            'location': 'USA'
        }
        
        success, response = self.run_test(
            "Valuate Watch (Text Only)",
            "POST",
            "valuate",
            200,
            data=form_data,
            files={}
        )
        
        if success and isinstance(response, dict):
            # Verify required fields in response
            required_fields = [
                'valuation_range', 'confidence_score', 'value_drivers', 
                'risk_factors', 'market_sentiment', 'signal', 
                'signal_justification', 'full_analysis'
            ]
            
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"⚠️  Missing required fields: {missing_fields}")
                return False
            
            # Verify valuation_range structure
            if 'valuation_range' in response:
                val_range = response['valuation_range']
                if not all(key in val_range for key in ['low', 'fair', 'high']):
                    print("⚠️  Valuation range missing required keys (low, fair, high)")
                    return False
                print(f"   Valuation Range: {val_range}")
            
            print(f"   Confidence: {response.get('confidence_score', 'N/A')}")
            print(f"   Signal: {response.get('signal', 'N/A')}")
            print(f"   Market Sentiment: {response.get('market_sentiment', 'N/A')}")
            
            return True
        
        return success

    def test_valuate_with_image(self):
        """Test valuation with image input"""
        form_data = {
            'brand': 'Omega',
            'model': 'Speedmaster',
            'reference': '311.30.42.30.01.005',
            'year': '2020',
            'case_size': '42mm',
            'case_material': 'Stainless Steel',
            'condition': 'Very Good',
            'location': 'Europe'
        }
        
        # Create test image
        image_data = self.create_test_image()
        files = {'image': ('test_watch.jpg', image_data, 'image/jpeg')}
        
        success, response = self.run_test(
            "Valuate Watch (With Image)",
            "POST",
            "valuate",
            200,
            data=form_data,
            files=files
        )
        
        if success and isinstance(response, dict):
            print(f"   Image processing successful")
            print(f"   Valuation Range: {response.get('valuation_range', 'N/A')}")
            print(f"   Confidence: {response.get('confidence_score', 'N/A')}")
            return True
        
        return success

    def test_valuation_history(self):
        """Test getting valuation history"""
        success, response = self.run_test(
            "Get Valuation History",
            "GET",
            "valuations/history",
            200
        )
        
        if success:
            if isinstance(response, list):
                print(f"   Retrieved {len(response)} historical valuations")
                if len(response) > 0:
                    print(f"   Sample entry keys: {list(response[0].keys())}")
            else:
                print(f"   Unexpected response type: {type(response)}")
        
        return success

    def test_invalid_endpoint(self):
        """Test invalid endpoint returns 404"""
        success, _ = self.run_test(
            "Invalid Endpoint",
            "GET",
            "nonexistent",
            404
        )
        return success

    def test_missing_required_fields(self):
        """Test valuation with missing required fields"""
        form_data = {
            'model': 'Submariner'  # Missing required 'brand' field
        }
        
        success, _ = self.run_test(
            "Missing Required Fields",
            "POST",
            "valuate",
            422  # Validation error
        )
        return success

def main():
    print("🚀 Starting Crowntime AI Backend API Tests")
    print("=" * 60)
    
    tester = CrowntimeAPITester()
    
    # Test sequence
    test_results = []
    
    # Basic API tests
    test_results.append(("Invalid Endpoint", tester.test_invalid_endpoint()))
    test_results.append(("Missing Required Fields", tester.test_missing_required_fields()))
    
    # Core functionality tests
    test_results.append(("Text-Only Valuation", tester.test_valuate_text_only()))
    test_results.append(("Image Valuation", tester.test_valuate_with_image()))
    test_results.append(("Valuation History", tester.test_valuation_history()))
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\nOverall: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.failed_tests:
        print("\n🔍 FAILED TEST DETAILS:")
        for failure in tester.failed_tests:
            print(f"- {failure}")
    
    # Return appropriate exit code
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())