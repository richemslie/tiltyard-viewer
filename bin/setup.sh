if [ -z "$GGPLIB_PATH" ]; then
    echo "Please set \$GGPLIB_PATH"
    echo "Please set \$GGPZERO_PATH"

else
    export ZBATTLE_PATH=`python2 -c "import os.path as p; print p.dirname(p.dirname(p.abspath('$BASH_SOURCE')))"`
    echo "Automatically setting \$ZBATTLE_PATH to $ZBATTLE_PATH"
    export PYTHONPATH=$ZBATTLE_PATH/lib:$PYTHONPATH
fi
