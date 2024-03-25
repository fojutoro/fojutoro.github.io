function parser(input){
    if(input != null && !['+', '-', '*', '/', "^"].includes(input[input.length - 1])){
        try{
            var fn = new Function("x", `return ${input}`);
            fn(0)
        } catch {
            return false
        }
        return fn
    }
}