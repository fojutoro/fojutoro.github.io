function parser(input){
    if(input != null && !['+', '-', '*', '/'].includes(input[input.length - 1])){
        var vars = input.match(/[a-xzA-XZ]+/g)
        if(vars != []){
        const variables = [...new Set(vars.join(''))];
        var fn;
        if(input.includes('=')){
            fn = new Function(...variables, input);
        } else {
            fn = new Function(...variables, `return ${input}`);
        }
        return fn
        }
    }
}