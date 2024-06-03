let videos_div;
let otbooks_div;
let ntbooks_div;

let ot_bible_books = [
    ["Gen", 50],
    ["Es", 40],
    ["Lv", 27],
    ["Nm", 36],
    ["Dt", 34],
    ["Gs", 24],
    ["Gdc", 21],
    ["Rt", 4],
    ["1Sam", 31],
    ["2Sam", 24],
    ["1Re", 22],
    ["2Re", 25],
    ["1Cr", 29],
    ["2Cr", 36],
    ["Esd", 10],
    ["Ne", 13],
    ["Tb", 14],
    ["Gdt", 16],
    ["Est", 10],
    ["1Mac", 16],
    ["2Mac", 15],
    ["Gb", 42],
    ["Sal", 150],
    ["Pr", 31],
    ["Qo", 12],
    ["Ct", 8],
    ["Sap", 19],
    ["Sir", 51],
    ["Is", 66],
    ["Ger", 52],
    ["Lam", 5],
    ["Bar", 6],
    ["Ez", 48],
    ["Dn", 14],
    ["Os", 14],
    ["Gl", 4],
    ["Am", 9],
    ["Abd", 1],
    ["Gn", 4],
    ["Mi", 7],
    ["Na", 3],
    ["Ab", 3],
    ["Sof", 3],
    ["Ag", 2],
    ["Zc", 14],
    ["Ml", 3],
];
let nt_bible_books = [
    ["Mt", 28],
    ["Mc", 16],
    ["Lc", 24],
    ["Gv", 21],
    ["At", 28],
    ["Rm", 16],
    ["1Cor", 16],
    ["2Cor", 13],
    ["Gal", 6],
    ["Ef", 6],
    ["Fil", 4],
    ["Col", 4],
    ["1Ts", 5],
    ["2Ts", 3],
    ["1Tm", 6],
    ["2Tm", 4],
    ["Tt", 3],
    ["Fm", 1],
    ["Eb", 13],
    ["Gc", 5],
    ["1Pt", 5],
    ["2Pt", 3],
    ["1Gv", 5],
    ["2Gv", 1],
    ["2Gv", 1],
    ["Gd", 1],
    ["Ap", 22],
];

let parse_bible_citation = (citation) => {
    let [b, c, v] = citation.split(/[\s,]/);
    return [b, Number(c), v];
}

let initialize_collapsibles = () => {
    let coll = document.getElementsByClassName("collapsiblebtn");
    for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    }
}

let highlight_matching_citation = (str, b, ch) => {
    let [bs, chs, _] = parse_bible_citation(str);
    let condition = bs === b && ch === chs;
    console.log(str, b, ch, condition);
    return bs === b && ch === chs ? `<span style="background-color: yellow;">${str}</span>` : str;
}

let format_vid = (v, [b, ch] = ["", 0]) => {
    return `<a href="https://youtu.be/${v.id}">${v.titolo}</a>` +
        (v.scrittura.length > 0 ? ` (<i>${
            v.scrittura.map((x) => highlight_matching_citation(
                x.replace('TODO', '<span style="color: red;"><b>TODO</b></span>').replace(/\[(.*)\]/, (x) => `<small>${x}</small>`),
                b, ch)
            ).join('</i>; <i>')
        }</i>)` : "");
}

let format_book = (title) => {
    if (title === "Mt" || title === "Mc" || title === "Lc" || title === "Gv") {
        return `<b>${title}</b>`;
    }
    return title;
}

let initialize_videos = () => {
    let list_html = `<ul>${video.map((v) => `<li>${format_vid(v)}</li>`).join("")}</ul>`;
    videos_div.innerHTML = list_html;
}

let initialize_bible = (books, div) => {
    let cited_books = new Map(books.map((b) => [b[0], { n_chapters: b[1], cited_chapters: new Map() }]));

    for (v of video) {
        for (s of v.scrittura) {
            let [bt, c, n] = parse_bible_citation(s);
            if (cited_books.has(bt) && c > 0 && cited_books.get(bt).n_chapters >= c) {
                if (!cited_books.get(bt).cited_chapters.has(c)) {
                    cited_books.get(bt).cited_chapters.set(c, new Set());
                }
                cited_books.get(bt).cited_chapters.get(c).add(v);
            }
        }
    }

    let cited_array = Array.from(cited_books).filter((x) => x[1].cited_chapters.size > 0);
    cited_array.sort((a, b) => {
        let indexes = books.map((x) => x[0]);
        let aidx = indexes.indexOf(a);
        let bidx = indexes.indexOf(b);
        if (aidx === bidx) {
            return 0;
        } else {
            return (aidx < bidx) ? -1 : 1;
        }
    });

    let cited_chapters_array = cited_array.map((x) => [x[0], Array.from(x[1].cited_chapters)]);

    for (cc of cited_chapters_array) {
        cc[1].sort((a, b) => {
            if (a[0] === b[0]) {
                return 0;
            } else {
                return (a[0] < b[0]) ? -1 : 1;
            }
        });
        
        for (ccc of cc[1]) {
            ccc[1] = Array.from(ccc[1]);
            ccc[1].sort((a, b) => {
                let aidx = video.indexOf(a);
                let bidx = video.indexOf(b);
                if (aidx === bidx) {
                    return 0;
                } else {
                    return (aidx < bidx) ? -1 : 1;
                }
            });
        }
    }

    div.innerHTML = `<ul>${cited_chapters_array.map((b) => `<li class="inlinelst"><button type="button" class="collapsiblebtn">${format_book(b[0])}</button> <ul class="collapsiblectn">${b[1].map((c) => `<li class="inlinelst"><button type="button" class="collapsiblebtn">${c[0]}</button> <ul class="collapsiblectn">${c[1].map((v) => `<li>${format_vid(v, [b[0], c[0]])}</li>`).join("")}</ul></li>`).join("")}</ul></li>`).join("")}</ul>`;
}

window.onload = () => {
    videos_div = document.getElementById("videos_list");
    otbooks_div = document.getElementById("otbooks");
    ntbooks_div = document.getElementById("ntbooks");

    // console.log(video.length);
    
    initialize_bible(ot_bible_books, otbooks_div);
    initialize_bible(nt_bible_books, ntbooks_div);
    initialize_videos();
    initialize_collapsibles();
};