# from fastapi import FastAPI, File, UploadFile
# from fastapi.middleware.cors import CORSMiddleware
# from ultralytics import YOLO
# from PIL import Image
# import io
# import datetime
# import torch  # IMPORT ADDED FOR FIX
# # IMPORT MODULES FOR SECURITY FIX
# import torch.nn.modules.container
# import torch.nn.modules.conv
# import torch.nn.modules.batchnorm
# import torch.nn.modules.activation
# import torch.nn.modules.pooling

# app = FastAPI()

# # Allow Frontend to call API
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # --- FIX FOR WeightsUnpickler Error (PyTorch 2.6+) ---
# # Error log onujayi Sequential ebong onno common layer gulo allow kora holo
# try:
#     from ultralytics.nn.tasks import DetectionModel
#     from ultralytics.nn.modules.conv import Conv
#     from ultralytics.nn.modules.block import RepNCSPELAN4
    
#     torch.serialization.add_safe_globals([
#         DetectionModel,
#         torch.nn.modules.container.Sequential,
#         torch.nn.modules.conv.Conv2d,
#         torch.nn.modules.batchnorm.BatchNorm2d,
#         torch.nn.modules.activation.SiLU,
#         torch.nn.modules.pooling.MaxPool2d,
#         Conv,
#         RepNCSPELAN4,
#     ])
# except ImportError:
#     pass  # Jodi purono version hoy
# except AttributeError:
#     pass  # Jodi torch version safe globals support na kore
# # ----------------------------------------------------

# # Load Model Safely
# model = None
# try:
#     # Attempt to load model
#     model = YOLO("best.pt")
#     print("✅ Model loaded successfully!")
# except Exception as e:
#     print(f"⚠️ Warning: Model load failed. System will run in Fallback Mode.\nError: {e}")

# @app.post("/predict")
# async def predict_image(file: UploadFile = File(...)):
#     # Read Image
#     image_data = await file.read()
#     try:
#         image = Image.open(io.BytesIO(image_data))
#     except:
#         return {"error": "Invalid Image"}
    
#     timestamp = datetime.datetime.now().strftime("%H:%M:%S")
#     id_val = f"PCB-{int(datetime.datetime.now().timestamp())}"

#     if model:
#         try:
#             # Run Inference
#             results = model(image)
#             result = results[0]
            
#             if len(result.boxes) > 0:
#                 # Get best detection
#                 best_box = sorted(result.boxes, key=lambda x: x.conf[0], reverse=True)[0]
#                 class_id = int(best_box.cls[0])
#                 class_name = result.names[class_id]
#                 confidence = float(best_box.conf[0])
                
#                 # Calculate Bounding Box %
#                 img_w, img_h = image.size
#                 x1, y1, x2, y2 = best_box.xyxy[0].tolist()
                
#                 box = {
#                     "left": f"{(x1/img_w)*100}%",
#                     "top": f"{(y1/img_h)*100}%",
#                     "width": f"{((x2-x1)/img_w)*100}%",
#                     "height": f"{((y2-y1)/img_h)*100}%"
#                 }
                
#                 is_good = "Good" in class_name
                
#                 return {
#                     "id": id_val,
#                     "status": "GOOD BOARD" if is_good else "DEFECTIVE BOARD",
#                     "details": class_name,
#                     "color": "green" if is_good else "red",
#                     "timestamp": timestamp,
#                     "confidence": round(confidence * 100, 1),
#                     "boundingBox": box
#                 }
#             else:
#                 # No object detected
#                 return {
#                     "id": id_val,
#                     "status": "UNKNOWN",
#                     "details": "No_PCB_Detected",
#                     "color": "yellow",
#                     "timestamp": timestamp,
#                     "confidence": 0.0,
#                     "boundingBox": None
#                 }
#         except Exception as e:
#             print(f"Inference Error: {e}")
#             return create_error_response(id_val, timestamp, "Inference_Error")
#     else:
#         # Fallback if model is missing (Prevents React Crash)
#         return create_error_response(id_val, timestamp, "Model_Not_Loaded")

# def create_error_response(id_val, timestamp, detail_msg):
#     return {
#         "id": id_val,
#         "status": "SYSTEM ERROR",
#         "details": detail_msg, # Safe string for React
#         "color": "red",
#         "timestamp": timestamp,
#         "confidence": 0.0,
#         "boundingBox": None
#     }


from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import datetime
import torch

# IMPORT MODULES FOR SECURITY FIX (PyTorch 2.6+)
import torch.nn.modules.container
import torch.nn.modules.conv
import torch.nn.modules.batchnorm
import torch.nn.modules.activation
import torch.nn.modules.pooling

app = FastAPI()

# Allow Frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SECURITY FIX ---
try:
    from ultralytics.nn.tasks import DetectionModel
    from ultralytics.nn.modules.conv import Conv
    from ultralytics.nn.modules.block import RepNCSPELAN4
    
    torch.serialization.add_safe_globals([
        DetectionModel,
        torch.nn.modules.container.Sequential,
        torch.nn.modules.conv.Conv2d,
        torch.nn.modules.batchnorm.BatchNorm2d,
        torch.nn.modules.activation.SiLU,
        torch.nn.modules.pooling.MaxPool2d,
        Conv,
        RepNCSPELAN4,
    ])
except ImportError:
    pass
except AttributeError:
    pass
# --------------------

# Load Model Safely
model = None
try:
    model = YOLO("best.pt")
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"⚠️ Warning: Model load failed.\nError: {e}")

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    # Read Image
    image_data = await file.read()
    try:
        image = Image.open(io.BytesIO(image_data))
    except:
        return {"error": "Invalid Image"}
    
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    id_val = f"PCB-{int(datetime.datetime.now().timestamp())}"

    if model:
        try:
            # Run Inference
            results = model(image)
            result = results[0]
            
            detections = []
            is_defective = False
            top_class = "No Detection"
            top_conf = 0.0

            img_w, img_h = image.size

            if len(result.boxes) > 0:
                # Process ALL detected boxes
                for box in result.boxes:
                    class_id = int(box.cls[0])
                    class_name = result.names[class_id]
                    confidence = float(box.conf[0])
                    
                    # Convert cords to % for React
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    box_coords = {
                        "left": f"{(x1/img_w)*100}%",
                        "top": f"{(y1/img_h)*100}%",
                        "width": f"{((x2-x1)/img_w)*100}%",
                        "height": f"{((y2-y1)/img_h)*100}%"
                    }

                    # Determine if this specific object is a defect
                    # (Assuming 'Good' is in the class name for good parts)
                    is_this_good = "Good" in class_name
                    if not is_this_good:
                        is_defective = True

                    detections.append({
                        "class": class_name,
                        "confidence": round(confidence * 100, 1),
                        "box": box_coords,
                        "color": "green" if is_this_good else "red"
                    })

                    # Track highest confidence for summary
                    if confidence > top_conf:
                        top_conf = confidence
                        top_class = class_name

                # Final Status Calculation
                final_status = "DEFECTIVE BOARD" if is_defective else "GOOD BOARD"
                final_color = "red" if is_defective else "green"

                return {
                    "id": id_val,
                    "status": final_status,
                    "details": top_class, # Main detection name
                    "all_detections": detections, # List of ALL detections
                    "color": final_color,
                    "timestamp": timestamp,
                    "confidence": round(top_conf * 100, 1)
                }
            else:
                return {
                    "id": id_val,
                    "status": "UNKNOWN",
                    "details": "No_PCB_Detected",
                    "all_detections": [],
                    "color": "yellow",
                    "timestamp": timestamp,
                    "confidence": 0.0
                }
        except Exception as e:
            print(f"Inference Error: {e}")
            return create_error_response(id_val, timestamp, "Inference_Error")
    else:
        return create_error_response(id_val, timestamp, "Model_Not_Loaded")

def create_error_response(id_val, timestamp, detail_msg):
    return {
        "id": id_val,
        "status": "SYSTEM ERROR",
        "details": detail_msg,
        "all_detections": [],
        "color": "red",
        "timestamp": timestamp,
        "confidence": 0.0
    }