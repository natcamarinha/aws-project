import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductRepo } from "/opt/nodejs/productsLayer";
import { DynamoDB } from 'aws-sdk';

const productsDdb = process.env.PRODUCTS_DDB!;
const ddbClient = new DynamoDB.DocumentClient();
const productRepo = new ProductRepo(ddbClient, productsDdb)

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`);
  
  const method = event.httpMethod
  if (event.resource === '/products') {
    if (method === 'GET') {
      console.log('GET /products');

      const products = await productRepo.getAllProducts();

      return {
        statusCode: 200,
        body: JSON.stringify(products)
      }
    }
  } else if (event.resource === '/products/{id}') {
    const productId = event.pathParameters!.id as string
    console.log(`GET /products/${productId}`);

    try {
      const product = await productRepo.getProductById(productId);
  
      return {
        statusCode: 200,
        body: JSON.stringify(product)
      }
    } catch (e) {
      console.error((<Error>e).message);
      return {
        statusCode: 404,
        body: (<Error>e).message
      }
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Bad request'
    })
  }
}