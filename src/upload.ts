import { Client } from 'minio'
import { Glob } from 'bun';
import path from 'path';

const client = new Client({
    endPoint: process.env['MINIO_ENDPOINT'] ?? '',
    port: process.env['MINIO_PORT'] ? parseInt(process.env['MINIO_PORT'] ?? '') : undefined,
    useSSL: process.env['MINIO_USE_SSL'] ? process.env['MINIO_USE_SSL'] === 'true' : true,
    accessKey: process.env['MINIO_USER'] ?? '',
    secretKey: process.env['MINIO_PASSWORD'] ?? ''
});

const glob = new Glob('**/**.json')

console.log('Starting to upload files to MinIO.')

for await (const filePath of glob.scan('./locales')) {
    const file = Bun.file(path.join('locales', filePath))

    const objectName = filePath.split(path.sep).join('/')

    console.log(`Uploading ${objectName} to MinIO`)

    await client.putObject('locales', objectName, Buffer.from(await file.arrayBuffer()));

    console.log(`Uploaded ${objectName} to MinIO`)
}

console.log('Finished uploading files to MinIO.')