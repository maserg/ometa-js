var ometajs_ = require("../../../");

var AbstractGrammar = ometajs_.grammars.AbstractGrammar;

var BSJSParser = ometajs_.grammars.BSJSParser;

var BSJSIdentity = ometajs_.grammars.BSJSIdentity;

var BSJSTranslator = ometajs_.grammars.BSJSTranslator;

var BSJSParser = function BSJSParser(source, opts) {
    AbstractGrammar.call(this, source, opts);
};

BSJSParser.grammarName = "BSJSParser";

BSJSParser.match = AbstractGrammar.match;

BSJSParser.matchAll = AbstractGrammar.matchAll;

exports.BSJSParser = BSJSParser;

require("util").inherits(BSJSParser, AbstractGrammar);

BSJSParser.prototype["space"] = function $space() {
    return this._atomic(function() {
        return this._rule("space", true, [], AbstractGrammar, AbstractGrammar.prototype["space"]);
    }) || this._seq(/^\/\/[^\n]*/) || this._seq(/^\/\*(.|[\r\n])*?\*\//);
};

BSJSParser.prototype["nameFirst"] = function $nameFirst() {
    return this._seq(/^([a-z$_])/i);
};

BSJSParser.prototype["nameLast"] = function $nameLast() {
    return this._seq(/^([a-z0-9$_])/i);
};

BSJSParser.prototype["iName"] = function $iName() {
    return this._seq(/^([a-z$_][a-z0-9$_]*)/i);
};

BSJSParser.prototype["isKeyword"] = function $isKeyword() {
    var x;
    return this._skip() && (x = this._getIntermediate(), true) && BSJSParser._isKeyword(x);
};

BSJSParser.prototype["name"] = function $name() {
    var n;
    return this._rule("iName", true, [], null, this["iName"]) && (n = this._getIntermediate(), true) && !this._atomic(function() {
        return this._rule("isKeyword", false, [ n ], null, this["isKeyword"]);
    }, true) && this._exec([ "name", n ]);
};

BSJSParser.prototype["keyword"] = function $keyword() {
    var k;
    return this._rule("iName", true, [], null, this["iName"]) && (k = this._getIntermediate(), true) && this._rule("isKeyword", false, [ k ], null, this["isKeyword"]) && this._exec([ k, k ]);
};

BSJSParser.prototype["hexDigit"] = function $hexDigit() {
    var x, v;
    return this._rule("char", true, [], null, this["char"]) && (x = this._getIntermediate(), true) && this._exec(BSJSParser.hexDigits.indexOf(x.toLowerCase())) && (v = this._getIntermediate(), true) && v >= 0 && this._exec(v);
};

BSJSParser.prototype["hexLit"] = function $hexLit() {
    return this._atomic(function() {
        var n, d;
        return this._rule("hexLit", false, [], null, this["hexLit"]) && (n = this._getIntermediate(), true) && this._rule("hexDigit", false, [], null, this["hexDigit"]) && (d = this._getIntermediate(), true) && this._exec(n * 16 + d);
    }) || this._atomic(function() {
        return this._rule("hexDigit", false, [], null, this["hexDigit"]);
    });
};

BSJSParser.prototype["number"] = function $number() {
    return this._atomic(function() {
        var n;
        return this._seq(/^(0x[0-9a-f]+)/) && (n = this._getIntermediate(), true) && this._exec([ "number", parseInt(n) ]);
    }) || this._atomic(function() {
        var f;
        return this._seq(/^(\d+((\.|[eE][\-+]?)\d+)?)/) && (f = this._getIntermediate(), true) && this._exec([ "number", parseFloat(f) ]);
    });
};

BSJSParser.prototype["escapeChar"] = function $escapeChar() {
    return this._atomic(function() {
        var s;
        return this._list(function() {
            return this._match("\\") && this._rule("char", false, [], null, this["char"]);
        }, true) && (s = this._getIntermediate(), true) && this._exec(function() {
            switch (s) {
              case '\\"':
                return '"';
              case "\\'":
                return "'";
              case "\\n":
                return "\n";
              case "\\r":
                return "\r";
              case "\\t":
                return "	";
              case "\\b":
                return "\b";
              case "\\f":
                return "\f";
              case "\\\\":
                return "\\";
              default:
                return s.charAt(1);
            }
        }.call(this));
    }) || this._atomic(function() {
        var s;
        return this._list(function() {
            return this._match("\\") && (this._atomic(function() {
                return this._match("u") && this._rule("hexDigit", false, [], null, this["hexDigit"]) && this._rule("hexDigit", false, [], null, this["hexDigit"]) && this._rule("hexDigit", false, [], null, this["hexDigit"]) && this._rule("hexDigit", false, [], null, this["hexDigit"]);
            }) || this._atomic(function() {
                return this._match("x") && this._rule("hexDigit", false, [], null, this["hexDigit"]) && this._rule("hexDigit", false, [], null, this["hexDigit"]);
            }));
        }, true) && (s = this._getIntermediate(), true) && this._exec(function() {
            return JSON.parse('"' + s + '"');
        }.call(this));
    });
};

BSJSParser.prototype["str"] = function $str() {
    return this._atomic(function() {
        var s;
        return this._seq(/^('([^'\\]|\\.)*')/) && (s = this._getIntermediate(), true) && this._exec(function() {
            function swap(quote) {
                return quote === '"' ? "'" : '"';
            }
            return [ "string", JSON.parse(preparseString(s.replace(/["']/g, swap))).replace(/["']/g, swap) ];
        }.call(this));
    }) || this._atomic(function() {
        var s;
        return this._seq(/^("([^"\\]|\\.)*")/) && (s = this._getIntermediate(), true) && this._exec([ "string", JSON.parse(preparseString(s)) ]);
    });
};

BSJSParser.prototype["special"] = function $special() {
    var s;
    return this._seq(/^((>>>|<<<|!==|===|&&=|\|\|=|!=|==|>=|<=|\+\+|\+=|--|-=|\*=|\/=|%=|&&|\|\||>>|&=|\|=|\^=|[\(\){}\[\],;?:><=\+\-\*\/%&|\^~\.!]))/) && (s = this._getIntermediate(), true) && this._exec([ s, s ]);
};

BSJSParser.prototype["token"] = function $token() {
    return this._rule("spaces", true, [], null, this["spaces"]) && (this._atomic(function() {
        return this._rule("name", true, [], null, this["name"]);
    }) || this._atomic(function() {
        return this._rule("keyword", true, [], null, this["keyword"]);
    }) || this._atomic(function() {
        return this._rule("number", true, [], null, this["number"]);
    }) || this._atomic(function() {
        return this._rule("str", true, [], null, this["str"]);
    }) || this._atomic(function() {
        return this._rule("special", true, [], null, this["special"]);
    }));
};

BSJSParser.prototype["toks"] = function $toks() {
    var ts;
    return this._any(function() {
        return this._atomic(function() {
            return this._rule("token", true, [], null, this["token"]);
        });
    }) && (ts = this._getIntermediate(), true) && this._rule("spaces", true, [], null, this["spaces"]) && this._rule("end", false, [], null, this["end"]) && this._exec(ts);
};

BSJSParser.prototype["spacesNoNl"] = function $spacesNoNl() {
    return this._any(function() {
        return this._atomic(function() {
            return !this._atomic(function() {
                return this._match("\n");
            }, true) && this._rule("space", false, [], null, this["space"]);
        });
    });
};

BSJSParser.prototype["expr"] = function $expr() {
    return this._rule("commaExpr", false, [], null, this["commaExpr"]);
};

BSJSParser.prototype["commaExpr"] = function $commaExpr() {
    return this._atomic(function() {
        var e1, e2;
        return this._rule("commaExpr", false, [], null, this["commaExpr"]) && (e1 = this._getIntermediate(), true) && this._rule("token", true, [ "," ], null, this["token"]) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (e2 = this._getIntermediate(), true) && this._exec([ "binop", ",", e1, e2 ]);
    }) || this._atomic(function() {
        return this._rule("asgnExpr", false, [], null, this["asgnExpr"]);
    });
};

BSJSParser.prototype["asgnExpr"] = function $asgnExpr() {
    var e;
    return this._rule("condExpr", false, [], null, this["condExpr"]) && (e = this._getIntermediate(), true) && (this._atomic(function() {
        var rhs;
        return this._rule("token", true, [ "=" ], null, this["token"]) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (rhs = this._getIntermediate(), true) && this._exec([ "set", e, rhs ]);
    }) || this._atomic(function() {
        var op, rhs;
        return (this._atomic(function() {
            return this._rule("token", true, [ "+=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "-=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "*=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "/=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "&&=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "||=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "%=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "<<=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ ">>=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ ">>>=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "&=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "^=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "|=" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (rhs = this._getIntermediate(), true) && this._exec([ "mset", e, op.slice(0, -1), rhs ]);
    }) || this._atomic(function() {
        return this._rule("empty", false, [], null, this["empty"]) && this._exec(e);
    }));
};

BSJSParser.prototype["condExpr"] = function $condExpr() {
    var e;
    return this._rule("orExpr", false, [], null, this["orExpr"]) && (e = this._getIntermediate(), true) && (this._atomic(function() {
        var t, f;
        return this._rule("token", true, [ "?" ], null, this["token"]) && this._rule("condExpr", false, [], null, this["condExpr"]) && (t = this._getIntermediate(), true) && this._rule("token", true, [ ":" ], null, this["token"]) && this._rule("condExpr", false, [], null, this["condExpr"]) && (f = this._getIntermediate(), true) && this._exec([ "condExpr", e, t, f ]);
    }) || this._atomic(function() {
        return this._rule("empty", false, [], null, this["empty"]) && this._exec(e);
    }));
};

BSJSParser.prototype["orExpr"] = function $orExpr() {
    return this._atomic(function() {
        var x, y;
        return this._rule("orExpr", false, [], null, this["orExpr"]) && (x = this._getIntermediate(), true) && this._rule("token", true, [ "||" ], null, this["token"]) && this._rule("andExpr", false, [], null, this["andExpr"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", "||", x, y ]);
    }) || this._atomic(function() {
        return this._rule("andExpr", false, [], null, this["andExpr"]);
    });
};

BSJSParser.prototype["andExpr"] = function $andExpr() {
    return this._atomic(function() {
        var x, y;
        return this._rule("andExpr", false, [], null, this["andExpr"]) && (x = this._getIntermediate(), true) && this._rule("token", true, [ "&&" ], null, this["token"]) && this._rule("bitExpr", false, [], null, this["bitExpr"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", "&&", x, y ]);
    }) || this._atomic(function() {
        return this._rule("bitExpr", false, [], null, this["bitExpr"]);
    });
};

BSJSParser.prototype["bitExpr"] = function $bitExpr() {
    return this._atomic(function() {
        var x, op, y;
        return this._rule("bitExpr", false, [], null, this["bitExpr"]) && (x = this._getIntermediate(), true) && (this._atomic(function() {
            return this._rule("token", true, [ "|" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "^" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "&" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("eqExpr", false, [], null, this["eqExpr"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", op, x, y ]);
    }) || this._atomic(function() {
        return this._rule("eqExpr", false, [], null, this["eqExpr"]);
    });
};

BSJSParser.prototype["eqExpr"] = function $eqExpr() {
    return this._atomic(function() {
        var x, op, y;
        return this._rule("eqExpr", false, [], null, this["eqExpr"]) && (x = this._getIntermediate(), true) && (this._atomic(function() {
            return this._rule("token", true, [ "==" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "!=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "===" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "!==" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("relExpr", false, [], null, this["relExpr"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", op, x, y ]);
    }) || this._atomic(function() {
        return this._rule("relExpr", false, [], null, this["relExpr"]);
    });
};

BSJSParser.prototype["relExpr"] = function $relExpr() {
    return this._atomic(function() {
        var x, op, y;
        return this._rule("relExpr", false, [], null, this["relExpr"]) && (x = this._getIntermediate(), true) && (this._atomic(function() {
            return this._rule("token", true, [ ">" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ ">=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "<" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "<=" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "instanceof" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "in" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("shiftExpr", false, [], null, this["shiftExpr"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", op, x, y ]);
    }) || this._atomic(function() {
        return this._rule("shiftExpr", false, [], null, this["shiftExpr"]);
    });
};

BSJSParser.prototype["shiftExpr"] = function $shiftExpr() {
    return this._atomic(function() {
        var op, y;
        return this._rule("shiftExpr", false, [], null, this["shiftExpr"]) && (this._atomic(function() {
            return this._rule("token", true, [ ">>>" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "<<<" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ ">>" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("addExpr", false, [], null, this["addExpr"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", op, x, y ]);
    }) || this._atomic(function() {
        return this._rule("addExpr", false, [], null, this["addExpr"]);
    });
};

BSJSParser.prototype["addExpr"] = function $addExpr() {
    return this._atomic(function() {
        var x, op, y;
        return this._rule("addExpr", false, [], null, this["addExpr"]) && (x = this._getIntermediate(), true) && (this._atomic(function() {
            return this._rule("token", true, [ "+" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "-" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("mulExpr", false, [], null, this["mulExpr"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", op, x, y ]);
    }) || this._atomic(function() {
        return this._rule("mulExpr", false, [], null, this["mulExpr"]);
    });
};

BSJSParser.prototype["mulExpr"] = function $mulExpr() {
    return this._atomic(function() {
        var x, op, y;
        return this._rule("mulExpr", false, [], null, this["mulExpr"]) && (x = this._getIntermediate(), true) && (this._atomic(function() {
            return this._rule("token", true, [ "*" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "/" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "%" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("unary", false, [], null, this["unary"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", op, x, y ]);
    }) || this._atomic(function() {
        return this._rule("unary", false, [], null, this["unary"]);
    });
};

BSJSParser.prototype["unary"] = function $unary() {
    return this._atomic(function() {
        var op, p;
        return (this._atomic(function() {
            return this._rule("token", true, [ "-" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "+" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("postfix", false, [], null, this["postfix"]) && (p = this._getIntermediate(), true) && this._exec([ "unop", op, p ]);
    }) || this._atomic(function() {
        var op, p;
        return (this._atomic(function() {
            return this._rule("token", true, [ "--" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "++" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("postfix", false, [], null, this["postfix"]) && (p = this._getIntermediate(), true) && this._exec([ "preop", op, p ]);
    }) || this._atomic(function() {
        var op, p;
        return (this._atomic(function() {
            return this._rule("token", true, [ "!" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "~" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "void" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "delete" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "typeof" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._rule("unary", false, [], null, this["unary"]) && (p = this._getIntermediate(), true) && this._exec([ "unop", op, p ]);
    }) || this._atomic(function() {
        return this._rule("postfix", false, [], null, this["postfix"]);
    });
};

BSJSParser.prototype["postfix"] = function $postfix() {
    var p;
    return this._rule("primExpr", false, [], null, this["primExpr"]) && (p = this._getIntermediate(), true) && (this._atomic(function() {
        var op;
        return this._rule("spacesNoNl", false, [], null, this["spacesNoNl"]) && (this._atomic(function() {
            return this._rule("token", true, [ "++" ], null, this["token"]);
        }) || this._atomic(function() {
            return this._rule("token", true, [ "--" ], null, this["token"]);
        })) && (op = this._getIntermediate(), true) && this._exec([ "postop", op, p ]);
    }) || this._atomic(function() {
        return this._rule("empty", false, [], null, this["empty"]) && this._exec(p);
    }));
};

BSJSParser.prototype["dotProp"] = function $dotProp() {
    var p;
    return this._skip() && (p = this._getIntermediate(), true) && (this._atomic(function() {
        var i;
        return this._rule("token", true, [ "[" ], null, this["token"]) && this._rule("expr", false, [], null, this["expr"]) && (i = this._getIntermediate(), true) && this._rule("token", true, [ "]" ], null, this["token"]) && this._exec([ "getp", i, p ]);
    }) || this._atomic(function() {
        var f;
        return this._rule("token", true, [ "." ], null, this["token"]) && this._rule("token", true, [ "name" ], null, this["token"]) && (f = this._getIntermediate(), true) && this._exec([ "getp", [ "string", f ], p ]);
    }) || this._atomic(function() {
        var f;
        return this._rule("token", true, [ "." ], null, this["token"]) && this._rule("spaces", false, [], null, this["spaces"]) && this._rule("iName", true, [], null, this["iName"]) && (f = this._getIntermediate(), true) && this._rule("isKeyword", false, [ f ], null, this["isKeyword"]) && this._exec([ "getp", [ "string", f ], p ]);
    }));
};

BSJSParser.prototype["primExpr"] = function $primExpr() {
    return this._atomic(function() {
        var p;
        return this._rule("primExpr", false, [], null, this["primExpr"]) && (p = this._getIntermediate(), true) && (this._atomic(function() {
            var as;
            return this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("listOf", false, [ "asgnExpr", "," ], null, this["listOf"]) && (as = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._exec([ "call", p ].concat(as));
        }) || this._atomic(function() {
            var m, as;
            return this._rule("token", true, [ "." ], null, this["token"]) && this._rule("token", true, [ "name" ], null, this["token"]) && (m = this._getIntermediate(), true) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("listOf", false, [ "asgnExpr", "," ], null, this["listOf"]) && (as = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._exec([ "send", m, p ].concat(as));
        }) || this._atomic(function() {
            var m, as;
            return this._rule("token", true, [ "." ], null, this["token"]) && this._rule("spaces", false, [], null, this["spaces"]) && this._rule("iName", true, [], null, this["iName"]) && (m = this._getIntermediate(), true) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("listOf", false, [ "asgnExpr", "," ], null, this["listOf"]) && (as = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("isKeyword", false, [ m ], null, this["isKeyword"]) && this._exec([ "send", m, p ].concat(as));
        }) || this._atomic(function() {
            var r;
            return this._rule("dotProp", false, [ p ], null, this["dotProp"]) && (r = this._getIntermediate(), true) && this._exec(r);
        }));
    }) || this._atomic(function() {
        return this._rule("memberExpr", false, [], null, this["memberExpr"]);
    });
};

BSJSParser.prototype["memberExpr"] = function $memberExpr() {
    return this._atomic(function() {
        var p, r;
        return this._rule("memberExpr", false, [], null, this["memberExpr"]) && (p = this._getIntermediate(), true) && this._rule("dotProp", false, [ p ], null, this["dotProp"]) && (r = this._getIntermediate(), true) && this._exec(r);
    }) || this._atomic(function() {
        return this._rule("newExpr", false, [], null, this["newExpr"]);
    });
};

BSJSParser.prototype["newExpr"] = function $newExpr() {
    return this._atomic(function() {
        var n, as;
        return this._rule("token", true, [ "new" ], null, this["token"]) && this._rule("memberExpr", false, [], null, this["memberExpr"]) && (n = this._getIntermediate(), true) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("listOf", false, [ "asgnExpr", "," ], null, this["listOf"]) && (as = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._exec([ "new", n ].concat(as));
    }) || this._atomic(function() {
        var n;
        return this._rule("token", true, [ "new" ], null, this["token"]) && this._rule("memberExpr", false, [], null, this["memberExpr"]) && (n = this._getIntermediate(), true) && this._exec([ "new", n ]);
    }) || this._atomic(function() {
        return this._rule("primExprHd", false, [], null, this["primExprHd"]);
    });
};

BSJSParser.prototype["primExprHd"] = function $primExprHd() {
    return this._atomic(function() {
        var e;
        return this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("expr", false, [], null, this["expr"]) && (e = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._exec([ "parens", e ]);
    }) || this._atomic(function() {
        return this._rule("token", true, [ "this" ], null, this["token"]) && this._exec([ "this" ]);
    }) || this._atomic(function() {
        var n;
        return this._rule("token", true, [ "name" ], null, this["token"]) && (n = this._getIntermediate(), true) && this._exec([ "get", n ]);
    }) || this._atomic(function() {
        var n;
        return this._rule("token", true, [ "number" ], null, this["token"]) && (n = this._getIntermediate(), true) && this._exec([ "number", n ]);
    }) || this._atomic(function() {
        var s;
        return this._rule("token", true, [ "string" ], null, this["token"]) && (s = this._getIntermediate(), true) && this._exec([ "string", s ]);
    }) || this._atomic(function() {
        return this._rule("func", false, [ true ], null, this["func"]);
    }) || this._atomic(function() {
        var n, as;
        return this._rule("token", true, [ "new" ], null, this["token"]) && this._rule("token", true, [ "name" ], null, this["token"]) && (n = this._getIntermediate(), true) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("listOf", false, [ "asgnExpr", "," ], null, this["listOf"]) && (as = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._exec([ "new", n ].concat(as));
    }) || this._atomic(function() {
        var n;
        return this._rule("token", true, [ "new" ], null, this["token"]) && this._rule("token", true, [ "name" ], null, this["token"]) && (n = this._getIntermediate(), true) && this._exec([ "new", n ]);
    }) || this._atomic(function() {
        var es;
        return this._rule("token", true, [ "[" ], null, this["token"]) && this._rule("listOf", false, [ "asgnExpr", "," ], null, this["listOf"]) && (es = this._getIntermediate(), true) && this._rule("token", true, [ "]" ], null, this["token"]) && this._exec([ "arr" ].concat(es));
    }) || this._atomic(function() {
        return this._rule("json", false, [], null, this["json"]);
    }) || this._atomic(function() {
        return this._rule("re", false, [], null, this["re"]);
    });
};

BSJSParser.prototype["json"] = function $json() {
    var bs;
    return this._rule("token", true, [ "{" ], null, this["token"]) && this._rule("listOf", false, [ "jsonBinding", "," ], null, this["listOf"]) && (bs = this._getIntermediate(), true) && this._rule("token", true, [ "}" ], null, this["token"]) && this._exec([ "json" ].concat(bs));
};

BSJSParser.prototype["jsonBinding"] = function $jsonBinding() {
    var n, v;
    return this._rule("jsonPropName", false, [], null, this["jsonPropName"]) && (n = this._getIntermediate(), true) && this._rule("token", true, [ ":" ], null, this["token"]) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (v = this._getIntermediate(), true) && this._exec([ "binding", n, v ]);
};

BSJSParser.prototype["jsonPropName"] = function $jsonPropName() {
    return this._atomic(function() {
        return this._rule("token", true, [ "name" ], null, this["token"]);
    }) || this._atomic(function() {
        return this._rule("token", true, [ "number" ], null, this["token"]);
    }) || this._atomic(function() {
        return this._rule("token", true, [ "string" ], null, this["token"]);
    }) || this._atomic(function() {
        var n;
        return this._rule("spaces", false, [], null, this["spaces"]) && this._rule("iName", true, [], null, this["iName"]) && (n = this._getIntermediate(), true) && this._rule("isKeyword", false, [ n ], null, this["isKeyword"]) && this._exec(n);
    });
};

BSJSParser.prototype["re"] = function $re() {
    var x;
    return this._rule("spaces", false, [], null, this["spaces"]) && this._list(function() {
        return this._match("/") && this._rule("reBody", false, [], null, this["reBody"]) && this._match("/") && this._any(function() {
            return this._atomic(function() {
                return this._rule("reFlag", false, [], null, this["reFlag"]);
            });
        });
    }, true) && (x = this._getIntermediate(), true) && this._exec([ "regExp", x ]);
};

BSJSParser.prototype["reBody"] = function $reBody() {
    return this._rule("re1stChar", false, [], null, this["re1stChar"]) && this._any(function() {
        return this._atomic(function() {
            return this._rule("reChar", false, [], null, this["reChar"]);
        });
    });
};

BSJSParser.prototype["re1stChar"] = function $re1stChar() {
    return this._atomic(function() {
        return !this._atomic(function() {
            return this._match("*") || this._match("\\") || this._match("/") || this._match("[");
        }, true) && this._rule("reNonTerm", false, [], null, this["reNonTerm"]);
    }) || this._atomic(function() {
        return this._rule("escapeChar", false, [], null, this["escapeChar"]);
    }) || this._atomic(function() {
        return this._rule("reClass", false, [], null, this["reClass"]);
    });
};

BSJSParser.prototype["reChar"] = function $reChar() {
    return this._atomic(function() {
        return this._rule("re1stChar", false, [], null, this["re1stChar"]);
    }) || this._match("*");
};

BSJSParser.prototype["reNonTerm"] = function $reNonTerm() {
    return !this._atomic(function() {
        return this._match("\n") || this._match("\r");
    }, true) && this._rule("char", false, [], null, this["char"]);
};

BSJSParser.prototype["reClass"] = function $reClass() {
    return this._match("[") && this._any(function() {
        return this._atomic(function() {
            return this._rule("reClassChar", false, [], null, this["reClassChar"]);
        });
    }) && this._match("]");
};

BSJSParser.prototype["reClassChar"] = function $reClassChar() {
    return !this._atomic(function() {
        return this._match("[") || this._match("]");
    }, true) && this._rule("reChar", false, [], null, this["reChar"]);
};

BSJSParser.prototype["reFlag"] = function $reFlag() {
    return this._rule("nameFirst", false, [], null, this["nameFirst"]);
};

BSJSParser.prototype["formal"] = function $formal() {
    return this._rule("spaces", false, [], null, this["spaces"]) && this._rule("token", true, [ "name" ], null, this["token"]);
};

BSJSParser.prototype["func"] = function $func() {
    var anon, n, fs, body;
    return this._skip() && (anon = this._getIntermediate(), true) && this._rule("token", true, [ "function" ], null, this["token"]) && this._optional(function() {
        return anon && this._rule("token", true, [ "name" ], null, this["token"]);
    }) && (n = this._getIntermediate(), true) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("listOf", false, [ "formal", "," ], null, this["listOf"]) && (fs = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("token", true, [ "{" ], null, this["token"]) && this._rule("srcElems", false, [], null, this["srcElems"]) && (body = this._getIntermediate(), true) && this._rule("token", true, [ "}" ], null, this["token"]) && this._exec([ "func", n || null, fs, body ]);
};

BSJSParser.prototype["sc"] = function $sc() {
    return this._atomic(function() {
        return this._rule("spacesNoNl", false, [], null, this["spacesNoNl"]) && (this._match("\n") || this._atomic(function() {
            return this._atomic(function() {
                return this._match("}");
            }, true);
        }) || this._atomic(function() {
            return this._rule("end", false, [], null, this["end"]);
        }));
    }) || this._atomic(function() {
        return this._rule("token", true, [ ";" ], null, this["token"]);
    });
};

BSJSParser.prototype["binding"] = function $binding() {
    return this._atomic(function() {
        var n, v;
        return this._rule("token", true, [ "name" ], null, this["token"]) && (n = this._getIntermediate(), true) && this._rule("token", true, [ "=" ], null, this["token"]) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (v = this._getIntermediate(), true) && this._exec([ n, v ]);
    }) || this._atomic(function() {
        var n;
        return this._rule("token", true, [ "name" ], null, this["token"]) && (n = this._getIntermediate(), true) && this._exec([ n ]);
    });
};

BSJSParser.prototype["block"] = function $block() {
    var ss;
    return this._rule("token", true, [ "{" ], null, this["token"]) && this._rule("srcElems", false, [], null, this["srcElems"]) && (ss = this._getIntermediate(), true) && this._rule("token", true, [ "}" ], null, this["token"]) && this._exec(ss);
};

BSJSParser.prototype["vars"] = function $vars() {
    var bs;
    return this._rule("token", true, [ "var" ], null, this["token"]) && this._rule("listOf", false, [ "binding", "," ], null, this["listOf"]) && (bs = this._getIntermediate(), true) && this._exec([ "var" ].concat(bs));
};

BSJSParser.prototype["stmt"] = function $stmt() {
    return this._atomic(function() {
        return this._rule("block", false, [], null, this["block"]);
    }) || this._atomic(function() {
        var bs;
        return this._rule("vars", false, [], null, this["vars"]) && (bs = this._getIntermediate(), true) && this._rule("sc", false, [], null, this["sc"]) && this._exec(bs);
    }) || this._atomic(function() {
        var c, t, f;
        return this._rule("token", true, [ "if" ], null, this["token"]) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("expr", false, [], null, this["expr"]) && (c = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("stmt", false, [], null, this["stmt"]) && (t = this._getIntermediate(), true) && (this._atomic(function() {
            return this._rule("token", true, [ "else" ], null, this["token"]) && this._rule("stmt", false, [], null, this["stmt"]);
        }) || this._atomic(function() {
            return this._rule("empty", false, [], null, this["empty"]) && this._exec([ "get", "undefined" ]);
        })) && (f = this._getIntermediate(), true) && this._exec([ "if", c, t, f ]);
    }) || this._atomic(function() {
        var c, s;
        return this._rule("token", true, [ "while" ], null, this["token"]) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("expr", false, [], null, this["expr"]) && (c = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("stmt", false, [], null, this["stmt"]) && (s = this._getIntermediate(), true) && this._exec([ "while", c, s ]);
    }) || this._atomic(function() {
        var s, c;
        return this._rule("token", true, [ "do" ], null, this["token"]) && this._rule("stmt", false, [], null, this["stmt"]) && (s = this._getIntermediate(), true) && this._rule("token", true, [ "while" ], null, this["token"]) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("expr", false, [], null, this["expr"]) && (c = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("sc", false, [], null, this["sc"]) && this._exec([ "doWhile", s, c ]);
    }) || this._atomic(function() {
        var i, c, u, s;
        return this._rule("token", true, [ "for" ], null, this["token"]) && this._rule("token", true, [ "(" ], null, this["token"]) && (this._atomic(function() {
            return this._rule("vars", false, [], null, this["vars"]);
        }) || this._atomic(function() {
            return this._rule("expr", false, [], null, this["expr"]);
        }) || this._atomic(function() {
            return this._rule("empty", false, [], null, this["empty"]) && this._exec([ "get", "undefined" ]);
        })) && (i = this._getIntermediate(), true) && this._rule("token", true, [ ";" ], null, this["token"]) && (this._atomic(function() {
            return this._rule("expr", false, [], null, this["expr"]);
        }) || this._atomic(function() {
            return this._rule("empty", false, [], null, this["empty"]) && this._exec([ "get", "true" ]);
        })) && (c = this._getIntermediate(), true) && this._rule("token", true, [ ";" ], null, this["token"]) && (this._atomic(function() {
            return this._rule("expr", false, [], null, this["expr"]);
        }) || this._atomic(function() {
            return this._rule("empty", false, [], null, this["empty"]) && this._exec([ "get", "undefined" ]);
        })) && (u = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("stmt", false, [], null, this["stmt"]) && (s = this._getIntermediate(), true) && this._exec([ "for", i, c, u, s ]);
    }) || this._atomic(function() {
        var cond, s;
        return this._rule("token", true, [ "for" ], null, this["token"]) && this._rule("token", true, [ "(" ], null, this["token"]) && (this._atomic(function() {
            var b, e;
            return this._rule("token", true, [ "var" ], null, this["token"]) && this._rule("binding", false, [], null, this["binding"]) && (b = this._getIntermediate(), true) && this._rule("token", true, [ "in" ], null, this["token"]) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (e = this._getIntermediate(), true) && this._exec([ [ "var", b ], e ]);
        }) || this._atomic(function() {
            var e;
            return this._rule("expr", false, [], null, this["expr"]) && (e = this._getIntermediate(), true) && e[0] === "binop" && e[1] === "in" && this._exec(function() {
                return e.slice(2);
            }.call(this));
        })) && (cond = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("stmt", false, [], null, this["stmt"]) && (s = this._getIntermediate(), true) && this._exec([ "forIn", cond[0], cond[1], s ]);
    }) || this._atomic(function() {
        var e, cs;
        return this._rule("token", true, [ "switch" ], null, this["token"]) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("expr", false, [], null, this["expr"]) && (e = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("token", true, [ "{" ], null, this["token"]) && this._any(function() {
            return this._atomic(function() {
                return this._atomic(function() {
                    var c, cs;
                    return this._rule("token", true, [ "case" ], null, this["token"]) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (c = this._getIntermediate(), true) && this._rule("token", true, [ ":" ], null, this["token"]) && this._rule("srcElems", false, [], null, this["srcElems"]) && (cs = this._getIntermediate(), true) && this._exec([ "case", c, cs ]);
                }) || this._atomic(function() {
                    var cs;
                    return this._rule("token", true, [ "default" ], null, this["token"]) && this._rule("token", true, [ ":" ], null, this["token"]) && this._rule("srcElems", false, [], null, this["srcElems"]) && (cs = this._getIntermediate(), true) && this._exec([ "default", cs ]);
                });
            });
        }) && (cs = this._getIntermediate(), true) && this._rule("token", true, [ "}" ], null, this["token"]) && this._exec([ "switch", e ].concat(cs));
    }) || this._atomic(function() {
        return this._rule("token", true, [ "break" ], null, this["token"]) && this._rule("sc", false, [], null, this["sc"]) && this._exec([ "break" ]);
    }) || this._atomic(function() {
        return this._rule("token", true, [ "continue" ], null, this["token"]) && this._rule("sc", false, [], null, this["sc"]) && this._exec([ "continue" ]);
    }) || this._atomic(function() {
        var e;
        return this._rule("token", true, [ "throw" ], null, this["token"]) && this._rule("spacesNoNl", false, [], null, this["spacesNoNl"]) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (e = this._getIntermediate(), true) && this._rule("sc", false, [], null, this["sc"]) && this._exec([ "throw", e ]);
    }) || this._atomic(function() {
        var t, e, c, f;
        return this._rule("token", true, [ "try" ], null, this["token"]) && this._rule("block", false, [], null, this["block"]) && (t = this._getIntermediate(), true) && this._rule("token", true, [ "catch" ], null, this["token"]) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("token", true, [ "name" ], null, this["token"]) && (e = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("block", false, [], null, this["block"]) && (c = this._getIntermediate(), true) && (this._atomic(function() {
            return this._rule("token", true, [ "finally" ], null, this["token"]) && this._rule("block", false, [], null, this["block"]);
        }) || this._atomic(function() {
            return this._rule("empty", false, [], null, this["empty"]) && this._exec([ "get", "undefined" ]);
        })) && (f = this._getIntermediate(), true) && this._exec([ "try", t, e, c, f ]);
    }) || this._atomic(function() {
        var e;
        return this._rule("token", true, [ "return" ], null, this["token"]) && (this._atomic(function() {
            return this._rule("expr", false, [], null, this["expr"]);
        }) || this._atomic(function() {
            return this._rule("empty", false, [], null, this["empty"]) && this._exec([ "get", "undefined" ]);
        })) && (e = this._getIntermediate(), true) && this._rule("sc", false, [], null, this["sc"]) && this._exec([ "return", e ]);
    }) || this._atomic(function() {
        var x, s;
        return this._rule("token", true, [ "with" ], null, this["token"]) && this._rule("token", true, [ "(" ], null, this["token"]) && this._rule("expr", false, [], null, this["expr"]) && (x = this._getIntermediate(), true) && this._rule("token", true, [ ")" ], null, this["token"]) && this._rule("stmt", false, [], null, this["stmt"]) && (s = this._getIntermediate(), true) && this._exec([ "with", x, s ]);
    }) || this._atomic(function() {
        var label, s;
        return this._rule("iName", true, [], null, this["iName"]) && (label = this._getIntermediate(), true) && this._rule("token", true, [ ":" ], null, this["token"]) && this._rule("stmt", false, [], null, this["stmt"]) && (s = this._getIntermediate(), true) && this._exec([ "label", label, s ]);
    }) || this._atomic(function() {
        var e;
        return this._rule("expr", false, [], null, this["expr"]) && (e = this._getIntermediate(), true) && this._rule("sc", false, [], null, this["sc"]) && this._exec(e);
    }) || this._atomic(function() {
        return this._rule("token", true, [ ";" ], null, this["token"]) && this._exec([ "get", "undefined" ]);
    });
};

BSJSParser.prototype["srcElem"] = function $srcElem() {
    var s;
    return (this._atomic(function() {
        return this._rule("func", false, [ false ], null, this["func"]);
    }) || this._atomic(function() {
        return this._rule("stmt", false, [], null, this["stmt"]);
    })) && (s = this._getIntermediate(), true) && this._exec([ "stmt", s ]);
};

BSJSParser.prototype["srcElems"] = function $srcElems() {
    var ss;
    return this._any(function() {
        return this._atomic(function() {
            return this._rule("srcElem", false, [], null, this["srcElem"]);
        });
    }) && (ss = this._getIntermediate(), true) && this._exec([ "begin" ].concat(ss));
};

BSJSParser.prototype["topLevel"] = function $topLevel() {
    var r;
    return this._rule("srcElems", false, [], null, this["srcElems"]) && (r = this._getIntermediate(), true) && this._rule("spaces", false, [], null, this["spaces"]) && this._rule("end", false, [], null, this["end"]) && this._exec(r);
};

BSJSParser.hexDigits = "0123456789abcdef";

BSJSParser.keywords = {};

var keywords = [ "break", "case", "catch", "continue", "default", "delete", "do", "else", "finally", "for", "function", "if", "in", "instanceof", "new", "return", "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with", "ometa" ];

for (var idx = 0; idx < keywords.length; idx++) BSJSParser.keywords[keywords[idx]] = true;

BSJSParser._isKeyword = function(k) {
    return BSJSParser.keywords.hasOwnProperty(k);
};

BSJSParser.reserved = {};

var reserved = [ "class", "enum", "export", "extends", "import", "super", "implements", "interface", "let", "package", "private", "protected", "public", "static", "yield", "short" ];

for (var idx = 0; idx < keywords.length; idx++) BSJSParser.reserved[keywords[idx]] = true;

BSJSParser._isReserved = function(k) {
    return BSJSParser.reserved.hasOwnProperty(k);
};

function preparseString(str) {
    return str.replace(/\\x([0-9a-f]{2})/ig, "\\u00$1").replace(/\\([0-9]{3})/ig, function(all, num) {
        var str = parseInt(num, 8).toString("hex");
        while (str.length < 4) str = "0" + str;
        return "\\u" + str;
    }).replace(/\\([^bfnOrtv'"\\])|(\\.)/ig, function(all, m1, m2) {
        return m1 || m2 || "";
    });
}

var BSSemActionParser = function BSSemActionParser(source, opts) {
    BSJSParser.call(this, source, opts);
};

BSSemActionParser.grammarName = "BSSemActionParser";

BSSemActionParser.match = BSJSParser.match;

BSSemActionParser.matchAll = BSJSParser.matchAll;

exports.BSSemActionParser = BSSemActionParser;

require("util").inherits(BSSemActionParser, BSJSParser);

BSSemActionParser.prototype["curlySemAction"] = function $curlySemAction() {
    var s;
    return this._atomic(function() {
        var r;
        return this._rule("token", true, [ "{" ], null, this["token"]) && this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (r = this._getIntermediate(), true) && this._rule("sc", false, [], null, this["sc"]) && this._rule("token", true, [ "}" ], null, this["token"]) && this._rule("spaces", false, [], null, this["spaces"]) && this._exec(r);
    }) || this._atomic(function() {
        var ss, s;
        return this._rule("token", true, [ "{" ], null, this["token"]) && this._any(function() {
            return this._atomic(function() {
                return this._rule("srcElem", false, [], null, this["srcElem"]) && (s = this._getIntermediate(), true) && this._atomic(function() {
                    return this._rule("srcElem", false, [], null, this["srcElem"]);
                }, true) && this._exec(s);
            });
        }) && (ss = this._getIntermediate(), true) && (this._atomic(function() {
            var r;
            return this._rule("asgnExpr", false, [], null, this["asgnExpr"]) && (r = this._getIntermediate(), true) && this._rule("sc", false, [], null, this["sc"]) && this._exec([ "return", r ]);
        }) || this._atomic(function() {
            return this._rule("srcElem", false, [], null, this["srcElem"]);
        })) && (s = this._getIntermediate(), true) && this._exec(ss.push(s)) && this._rule("token", true, [ "}" ], null, this["token"]) && this._rule("spaces", false, [], null, this["spaces"]) && this._exec([ "send", "call", [ "func", null, [], [ "begin" ].concat(ss) ], [ "this" ] ]);
    });
};

BSSemActionParser.prototype["semAction"] = function $semAction() {
    return this._atomic(function() {
        return this._rule("curlySemAction", false, [], null, this["curlySemAction"]);
    }) || this._atomic(function() {
        var r;
        return this._rule("primExpr", false, [], null, this["primExpr"]) && (r = this._getIntermediate(), true) && this._rule("spaces", false, [], null, this["spaces"]) && this._exec(r);
    });
};

var BSJSIdentity = function BSJSIdentity(source, opts) {
    AbstractGrammar.call(this, source, opts);
};

BSJSIdentity.grammarName = "BSJSIdentity";

BSJSIdentity.match = AbstractGrammar.match;

BSJSIdentity.matchAll = AbstractGrammar.matchAll;

exports.BSJSIdentity = BSJSIdentity;

require("util").inherits(BSJSIdentity, AbstractGrammar);

BSJSIdentity.prototype["trans"] = function $trans() {
    return this._atomic(function() {
        var t, ans;
        return this._list(function() {
            return this._skip() && (t = this._getIntermediate(), true) && this._rule("apply", false, [ t ], null, this["apply"]) && (ans = this._getIntermediate(), true);
        }) && this._exec(ans);
    }) || this._atomic(function() {
        var t;
        return this._list(function() {
            return this._skip() && (t = this._getIntermediate(), true);
        }) && this._exec(t);
    });
};

BSJSIdentity.prototype["curlyTrans"] = function $curlyTrans() {
    return this._atomic(function() {
        var r;
        return this._list(function() {
            return this._match("begin") && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (r = this._getIntermediate(), true);
        }) && this._exec([ "begin", r ]);
    }) || this._atomic(function() {
        var rs;
        return this._list(function() {
            return this._match("begin") && this._any(function() {
                return this._atomic(function() {
                    return this._rule("trans", false, [], null, this["trans"]);
                });
            }) && (rs = this._getIntermediate(), true);
        }) && this._exec([ "begin" ].concat(rs));
    }) || this._atomic(function() {
        var r;
        return this._rule("trans", false, [], null, this["trans"]) && (r = this._getIntermediate(), true) && this._exec(r);
    });
};

BSJSIdentity.prototype["this"] = function $this() {
    return this._exec([ "this" ]);
};

BSJSIdentity.prototype["break"] = function $break() {
    return this._exec([ "break" ]);
};

BSJSIdentity.prototype["continue"] = function $continue() {
    return this._exec([ "continue" ]);
};

BSJSIdentity.prototype["parens"] = function $parens() {
    var n;
    return this._rule("trans", false, [], null, this["trans"]) && (n = this._getIntermediate(), true) && this._exec([ "parens", n ]);
};

BSJSIdentity.prototype["number"] = function $number() {
    var n;
    return this._skip() && (n = this._getIntermediate(), true) && this._exec([ "number", n ]);
};

BSJSIdentity.prototype["string"] = function $string() {
    var s;
    return this._skip() && (s = this._getIntermediate(), true) && this._exec([ "string", s ]);
};

BSJSIdentity.prototype["regExp"] = function $regExp() {
    var x;
    return this._skip() && (x = this._getIntermediate(), true) && this._exec([ "regExp", x ]);
};

BSJSIdentity.prototype["arr"] = function $arr() {
    var xs;
    return this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (xs = this._getIntermediate(), true) && this._exec([ "arr" ].concat(xs));
};

BSJSIdentity.prototype["unop"] = function $unop() {
    var op, x;
    return this._skip() && (op = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec([ "unop", op, x ]);
};

BSJSIdentity.prototype["get"] = function $get() {
    var x;
    return this._skip() && (x = this._getIntermediate(), true) && this._exec([ "get", x ]);
};

BSJSIdentity.prototype["getp"] = function $getp() {
    var fd, x;
    return this._rule("trans", false, [], null, this["trans"]) && (fd = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec([ "getp", fd, x ]);
};

BSJSIdentity.prototype["set"] = function $set() {
    var lhs, rhs;
    return this._rule("trans", false, [], null, this["trans"]) && (lhs = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (rhs = this._getIntermediate(), true) && this._exec([ "set", lhs, rhs ]);
};

BSJSIdentity.prototype["mset"] = function $mset() {
    var lhs, op, rhs;
    return this._rule("trans", false, [], null, this["trans"]) && (lhs = this._getIntermediate(), true) && this._skip() && (op = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (rhs = this._getIntermediate(), true) && this._exec([ "mset", lhs, op, rhs ]);
};

BSJSIdentity.prototype["binop"] = function $binop() {
    var op, x, y;
    return this._skip() && (op = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (y = this._getIntermediate(), true) && this._exec([ "binop", op, x, y ]);
};

BSJSIdentity.prototype["preop"] = function $preop() {
    var op, x;
    return this._skip() && (op = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec([ "preop", op, x ]);
};

BSJSIdentity.prototype["postop"] = function $postop() {
    var op, x;
    return this._skip() && (op = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec([ "postop", op, x ]);
};

BSJSIdentity.prototype["return"] = function $return() {
    var x;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec([ "return", x ]);
};

BSJSIdentity.prototype["with"] = function $with() {
    var x, s;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (s = this._getIntermediate(), true) && this._exec([ "with", x, s ]);
};

BSJSIdentity.prototype["label"] = function $label() {
    var name, body;
    return this._skip() && (name = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (body = this._getIntermediate(), true) && this._exec([ "label", name, body ]);
};

BSJSIdentity.prototype["if"] = function $if() {
    var cond, t, e;
    return this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (t = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (e = this._getIntermediate(), true) && this._exec([ "if", cond, t, e ]);
};

BSJSIdentity.prototype["condExpr"] = function $condExpr() {
    var cond, t, e;
    return this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (t = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (e = this._getIntermediate(), true) && this._exec([ "condExpr", cond, t, e ]);
};

BSJSIdentity.prototype["while"] = function $while() {
    var cond, body;
    return this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._exec([ "while", cond, body ]);
};

BSJSIdentity.prototype["doWhile"] = function $doWhile() {
    var body, cond;
    return this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._exec([ "doWhile", body, cond ]);
};

BSJSIdentity.prototype["for"] = function $for() {
    var init, cond, upd, body;
    return this._rule("trans", false, [], null, this["trans"]) && (init = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (upd = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._exec([ "for", init, cond, upd, body ]);
};

BSJSIdentity.prototype["forIn"] = function $forIn() {
    var x, arr, body;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (arr = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._exec([ "forIn", x, arr, body ]);
};

BSJSIdentity.prototype["begin"] = function $begin() {
    return this._atomic(function() {
        var x;
        return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("end", false, [], null, this["end"]) && this._exec([ "begin", x ]);
    }) || this._atomic(function() {
        var xs;
        return this._any(function() {
            return this._atomic(function() {
                return this._rule("trans", false, [], null, this["trans"]);
            });
        }) && (xs = this._getIntermediate(), true) && this._exec([ "begin" ].concat(xs));
    });
};

BSJSIdentity.prototype["func"] = function $func() {
    var name, args, body;
    return this._skip() && (name = this._getIntermediate(), true) && this._skip() && (args = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._exec([ "func", name, args, body ]);
};

BSJSIdentity.prototype["call"] = function $call() {
    var fn, args;
    return this._rule("trans", false, [], null, this["trans"]) && (fn = this._getIntermediate(), true) && this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (args = this._getIntermediate(), true) && this._exec([ "call", fn ].concat(args));
};

BSJSIdentity.prototype["send"] = function $send() {
    var msg, recv, args;
    return this._skip() && (msg = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (recv = this._getIntermediate(), true) && this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (args = this._getIntermediate(), true) && this._exec([ "send", msg, recv ].concat(args));
};

BSJSIdentity.prototype["new"] = function $new() {
    var cls, args;
    return (this._atomic(function() {
        var str;
        return this._skip() && (str = this._getIntermediate(), true) && typeof str === "string" && this._exec(str);
    }) || this._atomic(function() {
        return this._rule("trans", false, [], null, this["trans"]);
    })) && (cls = this._getIntermediate(), true) && this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (args = this._getIntermediate(), true) && this._exec([ "new", cls ].concat(args));
};

BSJSIdentity.prototype["var"] = function $var() {
    var vs;
    return this._many(function() {
        return this._atomic(function() {
            return this._rule("varItem", false, [], null, this["varItem"]);
        });
    }) && (vs = this._getIntermediate(), true) && this._exec([ "var" ].concat(vs));
};

BSJSIdentity.prototype["varItem"] = function $varItem() {
    return this._atomic(function() {
        var n, v;
        return this._list(function() {
            return this._skip() && (n = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (v = this._getIntermediate(), true);
        }) && this._exec([ n, v ]);
    }) || this._atomic(function() {
        var n;
        return this._list(function() {
            return this._skip() && (n = this._getIntermediate(), true);
        }) && this._exec([ n ]);
    });
};

BSJSIdentity.prototype["throw"] = function $throw() {
    var x;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec([ "throw", x ]);
};

BSJSIdentity.prototype["try"] = function $try() {
    var x, name, c, f;
    return this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (x = this._getIntermediate(), true) && this._skip() && (name = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (c = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (f = this._getIntermediate(), true) && this._exec([ "try", x, name, c, f ]);
};

BSJSIdentity.prototype["json"] = function $json() {
    var props;
    return this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (props = this._getIntermediate(), true) && this._exec([ "json" ].concat(props));
};

BSJSIdentity.prototype["binding"] = function $binding() {
    var name, val;
    return this._skip() && (name = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (val = this._getIntermediate(), true) && this._exec([ "binding", name, val ]);
};

BSJSIdentity.prototype["switch"] = function $switch() {
    var x, cases;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (cases = this._getIntermediate(), true) && this._exec([ "switch", x ].concat(cases));
};

BSJSIdentity.prototype["case"] = function $case() {
    var x, y;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (y = this._getIntermediate(), true) && this._exec([ "case", x, y ]);
};

BSJSIdentity.prototype["stmt"] = function $stmt() {
    var s;
    return this._rule("trans", false, [], null, this["trans"]) && (s = this._getIntermediate(), true) && this._exec([ "stmt", s ]);
};

BSJSIdentity.prototype["default"] = function $default() {
    var y;
    return this._rule("trans", false, [], null, this["trans"]) && (y = this._getIntermediate(), true) && this._exec([ "default", y ]);
};

var BSJSTranslator = function BSJSTranslator(source, opts) {
    AbstractGrammar.call(this, source, opts);
};

BSJSTranslator.grammarName = "BSJSTranslator";

BSJSTranslator.match = AbstractGrammar.match;

BSJSTranslator.matchAll = AbstractGrammar.matchAll;

exports.BSJSTranslator = BSJSTranslator;

require("util").inherits(BSJSTranslator, AbstractGrammar);

BSJSTranslator.prototype["trans"] = function $trans() {
    var t, ans;
    return this._list(function() {
        return this._skip() && (t = this._getIntermediate(), true) && this._rule("apply", false, [ t ], null, this["apply"]) && (ans = this._getIntermediate(), true);
    }) && this._exec(ans);
};

BSJSTranslator.prototype["curlyTrans"] = function $curlyTrans() {
    return this._atomic(function() {
        var r;
        return this._list(function() {
            return this._match("begin") && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (r = this._getIntermediate(), true);
        }) && this._exec(r);
    }) || this._atomic(function() {
        var rs;
        return this._list(function() {
            return this._match("begin") && this._any(function() {
                return this._atomic(function() {
                    return this._rule("trans", false, [], null, this["trans"]);
                });
            }) && (rs = this._getIntermediate(), true);
        }) && this._exec("{" + rs.join(";") + "}");
    }) || this._atomic(function() {
        var r;
        return this._rule("trans", false, [], null, this["trans"]) && (r = this._getIntermediate(), true) && this._exec("{" + r + "}");
    });
};

BSJSTranslator.prototype["this"] = function $this() {
    return this._exec("this");
};

BSJSTranslator.prototype["break"] = function $break() {
    return this._exec("break");
};

BSJSTranslator.prototype["continue"] = function $continue() {
    return this._exec("continue");
};

BSJSTranslator.prototype["parens"] = function $parens() {
    var e;
    return this._rule("trans", false, [], null, this["trans"]) && (e = this._getIntermediate(), true) && this._exec("(" + e + ")");
};

BSJSTranslator.prototype["number"] = function $number() {
    var n;
    return this._skip() && (n = this._getIntermediate(), true) && this._exec(n);
};

BSJSTranslator.prototype["string"] = function $string() {
    var s;
    return this._skip() && (s = this._getIntermediate(), true) && this._exec(JSON.stringify(s + ""));
};

BSJSTranslator.prototype["regExp"] = function $regExp() {
    var x;
    return this._skip() && (x = this._getIntermediate(), true) && this._exec(x);
};

BSJSTranslator.prototype["arr"] = function $arr() {
    var $l0, $l1, xs;
    return ($l0 = this, $l1 = $l0.op, $l0.op = "[]", true) && (this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (xs = this._getIntermediate(), true) && this._exec("[" + xs.join(",") + "]") && ($l0.op = $l1, true) || ($l0.op = $l1, false));
};

BSJSTranslator.prototype["unop"] = function $unop() {
    var op, prevOp, $l2, $l3, t;
    return this._skip() && (op = this._getIntermediate(), true) && this._exec(this.op) && (prevOp = this._getIntermediate(), true) && ($l2 = this, $l3 = $l2.op, $l2.op = "u" + op, true) && (this._rule("trans", false, [], null, this["trans"]) && (t = this._getIntermediate(), true) && this._exec(function() {
        var res;
        if (op === "typeof" || op === "void" || op === "delete") {
            res = op + " " + t;
        } else {
            res = op + t;
        }
        if (BSJSTranslator.comparePriorities(prevOp, "u" + op)) {
            res = "(" + res + ")";
        }
        return res;
    }.call(this)) && ($l2.op = $l3, true) || ($l2.op = $l3, false));
};

BSJSTranslator.prototype["getp"] = function $getp() {
    var $l4, $l5, fd, tfd, x;
    return ($l4 = this, $l5 = $l4.op, $l4.op = ".", true) && (this._skip() && (fd = this._getIntermediate(), true) && this._rule("trans", false, [ fd ], null, this["trans"]) && (tfd = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec(function() {
        if (fd[0] === "string" && /^[$_a-z0-9][a-z0-9]*$/i.test(fd[1]) && !BSJSParser._isKeyword(fd[1]) && !BSJSParser._isReserved(fd[1])) {
            return x + "." + fd[1];
        } else {
            return x + "[" + tfd + "]";
        }
    }.call(this)) && ($l4.op = $l5, true) || ($l4.op = $l5, false));
};

BSJSTranslator.prototype["get"] = function $get() {
    var x;
    return this._skip() && (x = this._getIntermediate(), true) && this._exec(x);
};

BSJSTranslator.prototype["set"] = function $set() {
    var prevOp, lhs, $l6, $l7, rhs;
    return this._exec(this.op) && (prevOp = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (lhs = this._getIntermediate(), true) && ($l6 = this, $l7 = $l6.op, $l6.op = "=", true) && (this._rule("trans", false, [], null, this["trans"]) && (rhs = this._getIntermediate(), true) && this._exec(function() {
        if (BSJSTranslator.comparePriorities(prevOp, "=")) {
            return "(" + lhs + " = " + rhs + ")";
        } else {
            return lhs + " = " + rhs;
        }
    }.call(this)) && ($l6.op = $l7, true) || ($l6.op = $l7, false));
};

BSJSTranslator.prototype["mset"] = function $mset() {
    var prevOp, lhs, op, $l8, $l9, rhs;
    return this._exec(this.op) && (prevOp = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (lhs = this._getIntermediate(), true) && this._skip() && (op = this._getIntermediate(), true) && ($l8 = this, $l9 = $l8.op, $l8.op = op + "=", true) && (this._rule("trans", false, [], null, this["trans"]) && (rhs = this._getIntermediate(), true) && this._exec(function() {
        if (BSJSTranslator.comparePriorities(prevOp, op + "=")) {
            return "(" + lhs + " " + op + "= " + rhs + ")";
        } else {
            return lhs + " " + op + "= " + rhs;
        }
    }.call(this)) && ($l8.op = $l9, true) || ($l8.op = $l9, false));
};

BSJSTranslator.prototype["binop"] = function $binop() {
    var op, prevOp, $l10, $l11, x, y;
    return this._skip() && (op = this._getIntermediate(), true) && this._exec(this.op) && (prevOp = this._getIntermediate(), true) && ($l10 = this, $l11 = $l10.op, $l10.op = op, true) && (this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (y = this._getIntermediate(), true) && this._exec(function() {
        var res = x + " " + op + " " + y;
        if (BSJSTranslator.comparePriorities(prevOp, op)) {
            res = "(" + res + ")";
        }
        return res;
    }.call(this)) && ($l10.op = $l11, true) || ($l10.op = $l11, false));
};

BSJSTranslator.prototype["preop"] = function $preop() {
    var op, prevOp, $l12, $l13, x;
    return this._skip() && (op = this._getIntermediate(), true) && this._exec(this.op) && (prevOp = this._getIntermediate(), true) && ($l12 = this, $l13 = $l12.op, $l12.op = "u" + op, true) && (this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec(function() {
        var res = op + x;
        if (BSJSTranslator.comparePriorities(prevOp, "u" + op)) {
            res = "(" + res + ")";
        }
        return res;
    }.call(this)) && ($l12.op = $l13, true) || ($l12.op = $l13, false));
};

BSJSTranslator.prototype["postop"] = function $postop() {
    var op, prevOp, $l14, $l15, x;
    return this._skip() && (op = this._getIntermediate(), true) && this._exec(this.op) && (prevOp = this._getIntermediate(), true) && ($l14 = this, $l15 = $l14.op, $l14.op = "u" + op, true) && (this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec(function() {
        var res = x + op;
        if (BSJSTranslator.comparePriorities(prevOp, "u" + op)) {
            res = "(" + res + ")";
        }
        return res;
    }.call(this)) && ($l14.op = $l15, true) || ($l14.op = $l15, false));
};

BSJSTranslator.prototype["return"] = function $return() {
    var x;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec("return " + x);
};

BSJSTranslator.prototype["with"] = function $with() {
    var x, s;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (s = this._getIntermediate(), true) && this._exec("with(" + x + ")" + s);
};

BSJSTranslator.prototype["label"] = function $label() {
    var name, s;
    return this._skip() && (name = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (s = this._getIntermediate(), true) && this._exec(";" + name + ":" + s);
};

BSJSTranslator.prototype["if"] = function $if() {
    var cond, t, e;
    return this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (t = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (e = this._getIntermediate(), true) && this._exec("if(" + cond + ")" + t + "else" + e);
};

BSJSTranslator.prototype["condExpr"] = function $condExpr() {
    var prevOp, $l16, $l17, cond, t, e;
    return this._exec(this.op) && (prevOp = this._getIntermediate(), true) && ($l16 = this, $l17 = $l16.op, $l16.op = "?:", true) && (this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (t = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (e = this._getIntermediate(), true) && this._exec(function() {
        var res = cond + "?" + t + ":" + e;
        if (BSJSTranslator.comparePriorities(prevOp, "?:")) {
            res = "(" + res + ")";
        }
        return res;
    }.call(this)) && ($l16.op = $l17, true) || ($l16.op = $l17, false));
};

BSJSTranslator.prototype["while"] = function $while() {
    var cond, body;
    return this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._exec("while(" + cond + ")" + body);
};

BSJSTranslator.prototype["doWhile"] = function $doWhile() {
    var body, cond;
    return this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._exec("do" + body + "while(" + cond + ")");
};

BSJSTranslator.prototype["for"] = function $for() {
    var init, cond, upd, body;
    return this._rule("trans", false, [], null, this["trans"]) && (init = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (cond = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (upd = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._exec("for(" + init + ";" + cond + ";" + upd + ")" + body);
};

BSJSTranslator.prototype["forIn"] = function $forIn() {
    var x, arr, body;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (arr = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._exec("for(" + x + " in " + arr + ")" + body);
};

BSJSTranslator.prototype["begin"] = function $begin() {
    var x;
    return this._atomic(function() {
        var x;
        return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("end", false, [], null, this["end"]) && this._exec(x);
    }) || this._atomic(function() {
        var xs;
        return this._any(function() {
            return this._atomic(function() {
                return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && (this._atomic(function() {
                    return this._rule("end", false, [], null, this["end"]) && this._exec(x);
                }) || this._atomic(function() {
                    return this._rule("empty", false, [], null, this["empty"]) && this._exec(x + ";");
                }));
            });
        }) && (xs = this._getIntermediate(), true) && this._exec("{" + xs.join("") + "}");
    });
};

BSJSTranslator.prototype["func"] = function $func() {
    var name, args, body;
    return this._skip() && (name = this._getIntermediate(), true) && this._skip() && (args = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (body = this._getIntermediate(), true) && this._exec("function " + (name || "") + "(" + args.join(",") + ")" + body);
};

BSJSTranslator.prototype["call"] = function $call() {
    var fn, tfn, $l18, $l19, args;
    return this._skip() && (fn = this._getIntermediate(), true) && this._rule("trans", false, [ fn ], null, this["trans"]) && (tfn = this._getIntermediate(), true) && ($l18 = this, $l19 = $l18.op, $l18.op = "()", true) && (this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (args = this._getIntermediate(), true) && this._exec(function() {
        if (fn[1] === null) tfn = "(" + tfn + ")";
        return tfn + "(" + args.join(",") + ")";
    }.call(this)) && ($l18.op = $l19, true) || ($l18.op = $l19, false));
};

BSJSTranslator.prototype["send"] = function $send() {
    var msg, recv, args;
    return this._skip() && (msg = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (recv = this._getIntermediate(), true) && this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (args = this._getIntermediate(), true) && this._exec(recv + "." + msg + "(" + args.join(",") + ")");
};

BSJSTranslator.prototype["new"] = function $new() {
    var cls, args;
    return (this._atomic(function() {
        var str;
        return this._skip() && (str = this._getIntermediate(), true) && typeof str === "string" && this._exec(str);
    }) || this._atomic(function() {
        return this._rule("trans", false, [], null, this["trans"]);
    })) && (cls = this._getIntermediate(), true) && this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (args = this._getIntermediate(), true) && this._exec("new " + cls + "(" + args.join(",") + ")");
};

BSJSTranslator.prototype["var"] = function $var() {
    var vs;
    return this._many(function() {
        return this._atomic(function() {
            return this._rule("varItem", false, [], null, this["varItem"]);
        });
    }) && (vs = this._getIntermediate(), true) && this._exec("var " + vs.join(","));
};

BSJSTranslator.prototype["varItem"] = function $varItem() {
    return this._atomic(function() {
        var n, v, tv;
        return this._list(function() {
            return this._skip() && (n = this._getIntermediate(), true) && this._skip() && (v = this._getIntermediate(), true) && this._rule("trans", false, [ v ], null, this["trans"]) && (tv = this._getIntermediate(), true);
        }) && this._exec(function() {
            return n + " = " + (v[0] === "binop" && v[1] === "," ? "(" + tv + ")" : tv);
        }.call(this));
    }) || this._atomic(function() {
        var n;
        return this._list(function() {
            return this._skip() && (n = this._getIntermediate(), true);
        }) && this._exec(n);
    });
};

BSJSTranslator.prototype["throw"] = function $throw() {
    var x;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._exec("throw " + x);
};

BSJSTranslator.prototype["try"] = function $try() {
    var x, name, c, f;
    return this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (x = this._getIntermediate(), true) && this._skip() && (name = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (c = this._getIntermediate(), true) && this._rule("curlyTrans", false, [], null, this["curlyTrans"]) && (f = this._getIntermediate(), true) && this._exec("try " + x + "catch(" + name + ")" + c + "finally" + f);
};

BSJSTranslator.prototype["json"] = function $json() {
    var $l20, $l21, props;
    return ($l20 = this, $l21 = $l20.op, $l20.op = "{}", true) && (this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (props = this._getIntermediate(), true) && this._exec("{" + props.join(",") + "}") && ($l20.op = $l21, true) || ($l20.op = $l21, false));
};

BSJSTranslator.prototype["binding"] = function $binding() {
    var name, val;
    return this._skip() && (name = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (val = this._getIntermediate(), true) && this._exec(JSON.stringify(name) + ": " + val);
};

BSJSTranslator.prototype["switch"] = function $switch() {
    var x, cases;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._any(function() {
        return this._atomic(function() {
            return this._rule("trans", false, [], null, this["trans"]);
        });
    }) && (cases = this._getIntermediate(), true) && this._exec("switch(" + x + "){" + cases.join(";") + "}");
};

BSJSTranslator.prototype["case"] = function $case() {
    var x, y;
    return this._rule("trans", false, [], null, this["trans"]) && (x = this._getIntermediate(), true) && this._rule("trans", false, [], null, this["trans"]) && (y = this._getIntermediate(), true) && this._exec("case " + x + ": " + y);
};

BSJSTranslator.prototype["default"] = function $default() {
    var y;
    return this._rule("trans", false, [], null, this["trans"]) && (y = this._getIntermediate(), true) && this._exec("default: " + y);
};

BSJSTranslator.prototype["stmt"] = function $stmt() {
    var s, t;
    return this._skip() && (s = this._getIntermediate(), true) && this._rule("trans", false, [ s ], null, this["trans"]) && (t = this._getIntermediate(), true) && this._exec(function() {
        if (s[0] === "function" && s[1] === null || s[0] === "json") {
            return "(" + t + ")";
        }
        return t;
    }.call(this));
};

BSJSTranslator.opPriorities = {
    ".": 0,
    "[]": 0,
    "()": 0,
    "{}": 0,
    "u++": 1,
    "u--": 1,
    "u+": 2,
    "u-": 2,
    "u!": 2,
    "u~": 2,
    utypeof: 2,
    uvoid: 2,
    udelete: 2,
    "*": 3,
    "/": 3,
    "%": 3,
    "+": 4,
    "-": 4,
    "<<": 5,
    "<<<": 5,
    ">>": 5,
    "<": 6,
    "<=": 6,
    ">": 6,
    ">=": 6,
    "==": 7,
    "===": 7,
    "!=": 7,
    "!==": 7,
    "&": 8,
    "^": 9,
    "|": 10,
    "&&": 11,
    "||": 12,
    "?:": 13,
    "=": 14,
    "+=": 14,
    "-=": 14,
    "*=": 14,
    "/=": 14,
    "%=": 14,
    "<<=": 14,
    ">>=": 14,
    ">>>=": 14,
    "&=": 14,
    "^=": 14,
    "|=": 14,
    ",": 15
};

BSJSTranslator.comparePriorities = function(op1, op2) {
    return op1 != undefined && BSJSTranslator.opPriorities[op1] === undefined || BSJSTranslator.opPriorities[op1] < BSJSTranslator.opPriorities[op2];
};