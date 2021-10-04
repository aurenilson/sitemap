const axios = require('axios');
const fs    = require('fs');
const path  = require('path');

const router = [
    '', 
    'perfil', 
    'checkout', 
    'meuspedidos',
    'politicas/privacidade', 
    'politicas/cookies', 
    'politicas/termo-risco', 
    'politicas/termos-compra',
    'informacoes/perguntas-frequentes', 
    'informacoes/rio-do-boi'
];

let ignore = [
    'redefinirsenha',
    'validatemail', 
    'meuspedidos'
]

let apre          = []
let links         = []
let data          = new Date();
let dataFormatada = (data.getFullYear() + "-" + ((data.getMonth() + 1)) + "-" + (data.getDate() ));
let robots        = `User-agent: * \n`
let sitemap       = '<?xml version = "1.0" encoding = "UTF-8"?>\n'

const enpoint     = 'https://aparadosdaserra.eleventickets.com/router.php'
const param       = { class: "SuperIngresso", method: "getEventos" }

const sleep = (segundos) => {
    return new Promise(resolve => setTimeout(resolve, segundos * 1000))
}

const INIT = async () => {

    // =================================================================================
    // CAPTURANDO TODOS OS LINKS
    // =================================================================================

    router.forEach(item => {
        links.push(item)
    })

    // =================================================================================
    // CAPTURANDO TODOS OS EVENTOS (PRODUTOS)
    // =================================================================================
    
    new Promise(resolve => {
        resolve( axios.post(enpoint, param)
        .then(res =>  { apre = res.data.result; } ) )
    })
    
    // TRATANDO OS LINKS DAS APRESENTAÇÕES
    await sleep(3)
    
    apre.forEach(item => {
        links.push('produto/' + tratarLink(item.titulo))
    })
    
    // CRIANDO ROBOTS.TXT
    
    ignore.forEach(item => {
        robots += `Disallow: /${item} \n`
    })
    
    // console.log((robots))
    fs.writeFile(path.resolve(__dirname,'./public/robots.txt'), robots, (err) => {
        if (err) throw err;
        console.log('robots.txt foi criado!');
    });

    // CRIANDO SITMAP.XML

    sitemap += '<urlset>\n'
    links.forEach(item => {
        sitemap += `    <url>\n`
        sitemap += `        <loc>https://canionsverdes.eleventickets.com/${item}</loc>\n`
        sitemap += `        <lastmod>${dataFormatada}</lastmod>\n`
        sitemap += `        <changefreq>monthly</changefreq>\n`
        sitemap += `        <priority>0.8</priority>\n`
        sitemap += `    </url>\n`
    })
    sitemap += '</urlset>'
    
    // console.log((sitemap))
    fs.writeFile(path.resolve(__dirname,'./public/sitemap.xml'), sitemap, (err) => {
        if (err) throw err;
        console.log('sitemap.xml foi criado!');
    });

} 

INIT();

function tratarLink(str) {

    str = str.replace(/ /g, "-")
    str = str.replace(/---/g, "-");
    str = str.replace(/"/g, "");
    str = str.replace(/'/g, "");

    let com_acento = "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ";
    let sem_acento = "AAAAAAACEEEEIIIIDNOOOOOOUUUUYRsBaaaaaaaceeeeiiiionoooooouuuuybyr";
    let novastr = "";

    for(let i = 0; i < str.length; i++) {
        let troca = false;
        for (let a = 0; a < com_acento.length; a++) {
            if (str.substr(i, 1) == com_acento.substr(a, 1)) {
                novastr += sem_acento.substr(a,1);
                troca = true;
                break;
            }
        }
        if (troca == false) {
            novastr += str.substr(i, 1);
        }
    }

    return novastr.toLowerCase();
}