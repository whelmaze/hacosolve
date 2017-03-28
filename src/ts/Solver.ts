﻿export class NetOfCube {

    pieces: Piece[];
    all: Piece[];

    constructor() {
        this.pieces = new Array<Piece>(11);

        this.pieces[0] = Piece.fromString(
            "#   " +
            "####" +
            "#   "
            , 4);
        this.pieces[1] = Piece.fromString(
            "#   " +
            "####" +
            " #  "
            , 4);
        this.pieces[2] = Piece.fromString(
            "#   " +
            "####" +
            "  # "
            , 4);
        this.pieces[3] = Piece.fromString(
            "#   " +
            "####" +
            "   #"
            , 4);
        this.pieces[4] = Piece.fromString(
            " #  " +
            "####" +
            " #  "
            , 4);
        this.pieces[5] = Piece.fromString(
            " #  " +
            "####" +
            "  # "
            , 4);
        this.pieces[6] = Piece.fromString(
            "###  " +
            "  ###"
            , 5);
        this.pieces[7] = Piece.fromString(
            "##  " +
            " ###" +
            " #  "
            , 4);
        this.pieces[8] = Piece.fromString(
            "##  " +
            " ###" +
            "  # "
            , 4);
        this.pieces[9] = Piece.fromString(
            "##  " +
            " ###" +
            "   #"
            , 4);
        this.pieces[10] = Piece.fromString(
            "##  " +
            " ## " +
            "  ##"
            , 4);

        this.all = this.allCandidates();
    }

    // 同じ形状のピースを除いた全ての候補のリストを返す
    allCandidates(): Piece[] {

        let all: Piece[] = [];
        for (let i = 0; i < this.pieces.length; i++) {
            all = all.concat(this.pieces[i].variations());
        }

        let dist: Piece[] = [], comp: number[] = [];
        for (let i = 0; i < all.length; i++) {
            let hash = all[i].internalNumber;
            if (comp.indexOf(hash) == -1) {
                dist.push(all[i]);
                comp.push(hash);
            }
        }

        return dist;
    }
}

export class Piece {

    internal: boolean[];
    internalNumber: number;
    width: number;
    height: number;

    constructor(ns: boolean[], width: number) {
        this.internal = ns;
        this.internalNumber = Piece.calcInternalNumber(ns, width);
        this.width = width;
        this.height = ns.length / width;
    }

    eq(that: Piece): boolean {
        return this.internalNumber == that.internalNumber;
    }

    static calcInternalNumber(arr: boolean[], width: number): number {
        let ret = 0, e = 1, idx = arr.length - 1;
        while (0 <= idx) {
            if (arr[idx]) ret += e;
            e = e << 1;
            idx--;
        }
        // possible width = 2,3,4,5 (3bit)
        ret << 3;
        ret += width;
        return ret;
    }

    static fromString(pattern: string, width: number): Piece {
        // string -> boolean[]
        let ns = new Array<boolean>(pattern.length);
        for (let i = 0; i < pattern.length; i++) {
            if (pattern[i] != ' ') {
                ns[i] = true;
            } else {
                ns[i] = false;
            }
        }
        return new Piece(ns, width);
    }

    at(x: number, y: number): boolean {
        if (0 <= x && x < this.width && 0 <= y && y < this.height) {
            return this.internal[y * this.width + x];
        } else {
            return undefined;
        }
    }

    // 自身を90/180/270度回転したものとそれぞれの鏡像を作り、リストにぶち込んで返す
    variations(): Piece[] {
        let ret = new Array<Piece>(8);

        // self
        ret[0] = this;
        // mirror image
        ret[1] = this.mirrored();
        // rotate90
        ret[2] = this.rotated90();
        // rotate90 mirror
        ret[3] = ret[2].mirrored();
        // rotate180
        ret[4] = ret[2].rotated90();
        // rotate180 mirror
        ret[5] = ret[4].mirrored();
        // rotate270
        ret[6] = ret[4].rotated90();
        // rotate270 mirror
        ret[7] = ret[6].mirrored();

        return ret;
    }

    /*
    matchF(ns: number[], nsWidth: number, x: number, y: number): boolean {
        return this.matchF(ns, nsWidth, x, y, (n: number) => { return n != 1; });
    }
    */

    // 
    matchN(ns: number[], nsWidth: number, x: number, y: number): number {
        const h = ns.length / nsWidth | 0;
        let tileCheck = 0;

        if (nsWidth < x + this.width || h < y + this.height) return -1;

        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                const n = ns[(y + i) * nsWidth + (x + j)];

                if (this.internal[i * this.width + j] && n != 0) return -1;

                if (n == 1) tileCheck++;
            }
        }
        return tileCheck;
    }

    //matchF(ns: number[], nsWidth: number, x: number, y: number, f: (n: number) => boolean): boolean {
    match(ns: number[], nsWidth: number, x: number, y: number): boolean {
        const h = ns.length / nsWidth | 0;

        if (nsWidth < x + this.width || h < y + this.height) return false;

        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.internal[i * this.width + j]) {
                    if (ns[(y + i) * nsWidth + (x + j)] != 1) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    filled(ns: number[], nsWidth: number, x: number, y: number, fillNumber: number): number[] {

        let ret = [].concat(ns);
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.internal[i * this.width + j]) {
                    ret[(y + i) * nsWidth + (x + j)] = fillNumber;
                }
            }
        }
        return ret;
    }

    // このピースの鏡像を返す
    mirrored(): Piece {

        const l = this.internal.length;
        let ns = new Array<boolean>(l);
        const w = this.width;

        for (let i = w; i <= l; i += w) {
            for (let j = i - 1, k = i - w; k < i; j-- , k++) {
                ns[k] = this.internal[j];
            }
        }
        return new Piece(ns, w);
    }

    // このピースを右に90度回転したものを返す
    rotated90(): Piece {

        const l = this.internal.length;
        let ns = new Array<boolean>(l);
        const w = this.width;
        const h = this.height;

        for (let i = l - w, k = 0; i < l; i++) {
            for (let j = i; j >= 0; j -= w, k++) {
                ns[k] = this.internal[j];
            }
        }

        return new Piece(ns, this.height);
    }

    // デバッグ出力用
    toString() {

        let ret = '\n';
        for (let i = 0; i < this.internal.length; i++) {
            if (this.internal[i]) {
                ret += '#';
            } else {
                ret += ' ';
            }
            if ((i + 1) % this.width == 0) ret += '\n'
        }
        return ret;
    }

}

export class Solver {

    net: NetOfCube;
    // 答えが入る、見つかっていない場合はundefined
    solution: number[];
    skipCache: boolean[];
    skipCacheHit: number;
    message: string;
    foundCubeCount: number;

    constructor() {
        this.net = new NetOfCube();
        this.solution = undefined;
        this.skipCache = [];
        this.message = '';
        this.foundCubeCount = 0;
    }

    solve(ns: number[], width: number, callback: any, context): number[] {

        this.solution = undefined;
        // ns contains 0 or 1 only
        let sumTiles = ns.reduce((p, c, i, a) => p + c)
        // cant solve
        if (sumTiles % 6 != 0) {
            let mes = 'sum of tiles is ' + sumTiles + '. cant solve because cannot mod 6.';
            this.message = mes;
            console.log(mes)
            return ns;
        }

        // bounds
        const h = ns.length / width | 0;
        let sy = h, sx = width, lx = 0, ly = 0;
        for (let i = 0; i < ns.length; i++) {
            if (ns[i] == 1) {
                sy = Math.min(sy, i / width | 0);
                sx = Math.min(sx, i % width | 0);
                ly = Math.max(ly, i / width | 0);
                lx = Math.max(lx, i % width | 0);
            }
        }
        console.log("Bounds is (" + sx + ", " + sy + ") to (" + lx + ", " + ly + ")")

        this.skipCache = new Array<boolean>(ns.length);
        this.skipCacheHit = 0;

        const tileCount = sumTiles / 6 | 0;
        console.log("start! cube count: " + tileCount);
        let ret = this.solve1(this.copy(ns), width, tileCount, tileCount, 2, sx, sy, sx, sy, lx, ly, callback, context);
        console.log("skip_cache_hit: " + this.skipCacheHit);

        if (this.solution != undefined) {
            this.foundCubeCount = sumTiles / 6 | 0;
        }

        return ret;
    }

    // ある座標から5*5のエリアに空のタイルが19個以上ある場合、以後その座標のチェックはスルー
    skip(ns: number[], width: number, xx: number, yy: number): boolean {
        if (this.skipCache[yy * width + xx]) {
            this.skipCacheHit++;
            return true;
        }

        let emptyN = 0, tileN = 0, filledTileN = 0;
        const h = ns.length / width | 0;
        const xe = Math.min(width, xx + 5);
        const ye = Math.min(h, yy + 5);
        for (let i = xx; i < xe; i++) {
            for (let j = yy; j < ye; j++) {
                if (ns[j * width + i] == 1) {
                    tileN++;
                } else if (ns[j * width + i] == 0) {
                    emptyN++;
                } else {
                    filledTileN++;
                }
                if (tileN >= 6) return false;
                if (emptyN > 19) {
                    this.skipCache[yy * width + xx] = true;
                    return true;
                }
                if (emptyN + filledTileN > 19) return true;
            }
        }
    }

    // 一番左上にあるタイルに隣接したタイルが6つより少ないかどうか
    cutoffCheck(ns: number[], width: number): boolean {
        let cnt = 0;
        const st = ns.indexOf(1)
        if (st == -1) return true;
        let i = st / width | 0, j = st % width;
        const height = ns.length / width | 0;

        //console.log("a");
        let mark = new Array<boolean>(ns.length);
        const recur = function (x: number, y: number): number {
            //console.log("chk x:" + x + ", y:" + y);
            if (0 <= x && x < width && 0 <= y && y < height && !mark[y * width + x]) {
                mark[y * width + x] = true;
                if (ns[y * width + x] == 1) {
                    return 1 + recur(x + 1, y) + recur(x, y + 1) + recur(x, y - 1) + recur(x - 1, y);
                } else { return 0; }
            } else { return 0; }
        }
        const c = recur(j, i);
        //console.log("c: "+c);
        return c < 6;
    }

    solve1(ns: number[], width: number, count: number, countMax: number, fillNum: number, sx: number, sy: number, nx: number, ny: number, lx: number, ly: number, callback: any, context: any): number[] {

        if (count == 1) {
            //console.log("at last!!");
            //sx = 0;
            //sy = 0;
        }

        if (7 < fillNum) {
            fillNum = 2;
        }

        const h = ns.length / width | 0;
        const w = width;
        const len = h * w;

        if (count != countMax && this.cutoffCheck(ns, width)) {
            //console.log("-------cutoff!");
            return ns;
        }

        const nextX = nx, nextY = ny;

        for (let y = sy; y < ly; y++) {
            for (let x = sx; x < lx; x++) {

                if (nx != -1 && ny != -1) {
                    //console.log("nxy init. start from " + nx + "," + ny);
                    x = nx;
                    y = ny;
                    nx = -1;
                    ny = -1;
                }

                if (this.skip(ns, width, x, y)) {
                    continue;
                }

                if (this.solution != undefined) return ns;

                //console.log("count:" + count + ", chk(" + x + ", " + y + ") sxy["+sx+", "+sy+"]");

                const all = this.net.all;
                for (let i = 0; i < all.length; i++) {
                    if (this.solution == undefined && all[i].match(ns, w, x, y)) {
                        //console.log("count "+count+", at "+x+","+y+": matched "+all[i].internal_number+""+all[i].toString())
                        const a = all[i].filled(ns, w, x, y, fillNum);
                        if (count == 1) { // found solution
                            this.solution = this.copy(a);
                            ns = a;
                            return ns;
                        } else {
                            //console.log("stack------")
                            this.solve1(a, w, count - 1, countMax, fillNum + 1, sx, sy, x, y, lx, ly, callback, context);
                        }
                    }
                }
            }
            //console.log("nextline");
        }

        //callback.apply(context, [count]);
        //console.log("-------stack")
        return ns;
    }

    copy(ns: number[]): number[] {
        return [].concat(ns);
    }

}
