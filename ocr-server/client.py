import json, os
from dotenv import load_dotenv
import ocr_pb2, ocr_pb2_grpc
import grpc

load_dotenv()



addr = os.getenv('GRPC_SERVER_ADDRESS', 'localhost:50051')
creds = grpc.ssl_channel_credentials()
channel = grpc.insecure_channel(addr)
stub = ocr_pb2_grpc.InvoiceOCRStub(channel)

content = stub.UploadInvoice(ocr_pb2.UploadInvoiceRequest(user_id=100, invoice_file_path='batch2-0008.jpg'))
print(content)