from pydantic import BaseModel, EmailStr, validator, Field, ValidationError
from typing import Optional, Dict, Any, List, Tuple
import re

class CSVRecordSchema(BaseModel):
    name: str = Field(..., min_length=1)
    company: str = Field(..., min_length=1)
    email: EmailStr
    phone: Optional[str] = None
    
    @validator('phone')
    def validate_phone(cls, v):
        if not v:
            return None
        phone = str(v).strip()
        digits = re.sub(r'\D', '', phone)
        if not (10 <= len(digits) <= 15):
            raise ValueError("Invalid phone number")
        return phone

def validate_row(row_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validates a raw CSV row dictionary against the Pydantic schema.
    Returns a tuple of (is_valid, list_of_error_reasons).
    """
    try:
        # Pre-clean empty strings to None if they are supposed to be required strings
        cleaned_data = {k: (v.strip() if isinstance(v, str) else v) for k, v in row_data.items() if k and v is not None}
        
        # We need to map empty strings to missing for required fields so pydantic handles them correctly
        for field in ['name', 'company', 'email']:
            if field in cleaned_data and cleaned_data[field] == "":
                del cleaned_data[field]
                
        CSVRecordSchema(**cleaned_data)
        return True, []
        
    except ValidationError as e:
        reasons = []
        for error in e.errors():
            field = error['loc'][0] if error['loc'] else 'unknown'
            msg = error['msg']
            if field == 'name' and error['type'] == 'value_error.missing':
                reasons.append("Missing name")
            elif field == 'company' and error['type'] == 'value_error.missing':
                reasons.append("Missing company")
            elif field == 'email' and ('email' in error['type'] or error['type'] == 'value_error.missing'):
                reasons.append("Invalid email")
            elif field == 'phone':
                reasons.append("Invalid phone number")
            else:
                reasons.append(f"Invalid {field}: {msg}")
        return False, reasons
    except Exception as e:
        return False, [f"Unexpected error: {str(e)}"]
