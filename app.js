const Koa = require('koa');
const KoaRouter = require('koa-router');
const KoaBody = require('koa-body');
const mysql2 = require('mysql2');
const parsePath = require('parse-filepath');
const KoaStaticCache = require('koa-static-cache');
const fs = require("fs");

const app = new Koa();
const router = new KoaRouter();

const connection = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'yyz123asd',
    database: 'kkb'
});

app.use(KoaStaticCache('./public', {
    prefix: '/public',
    gzip: true,
    dynamic: true
}));
app.use(KoaStaticCache('./static', {
    prefix: '/static',
    gzip: true,
    dynamic: true
}));


router.get("/public", async ctx => {
    ctx.body = fs.readFileSync("./public/index.html").toString();
})

router.post('/upload', KoaBody({
    multipart: true,
    formidable: {
        uploadDir: './static/upload',
        keepExtensions: true
    }
}), async ctx => {
    let {
        upload
    } = ctx.request.files;
    const attachment = upload;
    let fileInfo = parsePath(upload.path);
    let filename = fileInfo.basename;
    let fileType = attachment.type;
    let fileSize = attachment.size;

    let rs = await query(
        "insert into `attachments` (`filename`, `type`, `size`) values (?, ?, ?)",
        [
            filename, fileType, fileSize
        ]
    );
    if (rs.affectedRows < 1) {
        ctx.body = {
            status: '上传失败'
        };
    } else {
        ctx.body = {
            filename
        };
    }

});



router.get('/getPhotos', async ctx => {
    // 从数据库获取上传后的所有图片数据，通过json格式返回给客户端
    // todos
    let data = await query(
        'select *  from `attachments`',
    );
 
    let newPhotoData = data.map(photo=>{
       const  {id,filename} = photo;
       return {id,filename};
    });
    ctx.body = newPhotoData; //json格式返回给客户端
})


app.use(router.routes());

app.listen(8888, () => {
    console.log(`服务启动成功 http://localhost:8888`);
})

function query(sql, data) {
    return new Promise((resolve, reject) => {
        connection.query(
            sql,
            data,
            function (err, ...result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(...result);
                }
            }
        );
    })
}


