const Dropzone = forwardRef(({ children, ...params }, ref) => {
  const { open, ...props } = useDropzone(params);

  useImperativeHandle(ref, () => ({ open }), [open]);

  // TODO: Figure out why react-styleguidist cannot create docs if we don't return a jsx element
  return <Fragment>{children({ ...props, open })}</Fragment>;
});
